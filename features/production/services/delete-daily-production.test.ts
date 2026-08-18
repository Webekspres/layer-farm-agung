import { beforeEach, describe, expect, mock, test } from "bun:test";

const findCorrection = mock(() => Promise.resolve(null as null | { id: string }));
const findUser = mock(() =>
  Promise.resolve(null as null | { role: { name: string } }),
);
const findProductionSetting = mock(() =>
  Promise.resolve(null as null | {
    staff_lookback_days: number;
    admin_lookback_days: number;
  }),
);
const findProduction = mock(() =>
  Promise.resolve(null as null | {
    id: string;
    cage_id: string;
    record_date: Date;
    tb: number;
    weight: number | null;
    cage: { location_id: string; cycle_settings: Array<{ start_date: Date; end_date: Date | null }> };
    items: Array<{ egg_grade_id: number; quantity: number }>;
  }),
);
const findGrades = mock(() =>
  Promise.resolve([] as Array<{ id: number; code: string | null }>),
);
const findEggItem = mock(() => Promise.resolve(null as null | { id: string }));
const deleteProduction = mock(() => Promise.resolve({}));
const deleteItems = mock(() => Promise.resolve({ count: 0 }));
const applyStock = mock(() => Promise.resolve({ ok: true as const }));
const transaction = mock(
  async (fn: (tx: {
    dailyProduction: { delete: typeof deleteProduction };
    dailyProductionItem: { deleteMany: typeof deleteItems };
  }) => Promise<string>) =>
    fn({
      dailyProduction: { delete: deleteProduction },
      dailyProductionItem: { deleteMany: deleteItems },
    }),
);

mock.module("@/lib/prisma", () => ({
  default: {
    dailyInputCorrection: { findUnique: findCorrection },
    user: { findUnique: findUser },
    tenantProductionSetting: { findUnique: findProductionSetting },
    dailyProduction: { findFirst: findProduction },
    eggGrade: { findMany: findGrades },
    item: { findFirst: findEggItem },
    $transaction: transaction,
  },
}));

const isAssigned = mock(() => Promise.resolve(true));
mock.module("@/features/cages/services/is-user-assigned-to-cage", () => ({
  isUserAssignedToCage: isAssigned,
}));

mock.module("@/features/inventory/services/apply-stock-mutation", () => ({
  applyStockMutation: applyStock,
}));

type CorrectionArgs = {
  tenantId: string;
  cageId: string;
  recordDate: Date;
  actorUserId: string;
  reason: string;
  changes: Array<{
    component: string;
    recordId: string;
    field: string;
    before: number | string | null;
    after: number | string | null;
  }>;
  clientMutationId?: string;
};

const recordCorrection = mock(() =>
  Promise.resolve({
    ok: true as const,
    idempotent: false,
    correctionId: "corr-new",
  }),
);
mock.module("@/features/production/services/record-correction-event", () => ({
  recordCorrectionEvent: recordCorrection,
}));

const { deleteDailyProduction } = await import(
  "@/features/production/services/delete-daily-production"
);

const existingRecord = {
  id: "rec-1",
  cage_id: "cage-1",
  record_date: new Date("2026-08-12"),
  tb: 10,
  weight: 62,
  cage: {
    location_id: "loc-1",
    cycle_settings: [{ start_date: new Date("2026-01-01"), end_date: null }],
  },
  items: [
    { egg_grade_id: 1, quantity: 10 },
    { egg_grade_id: 2, quantity: 0 },
  ],
};

describe("deleteDailyProduction", () => {
  beforeEach(() => {
    findCorrection.mockReset();
    findUser.mockReset();
    findProductionSetting.mockReset();
    findProduction.mockReset();
    findGrades.mockReset();
    findEggItem.mockReset();
    deleteProduction.mockReset();
    deleteItems.mockReset();
    applyStock.mockReset();
    transaction.mockReset();
    isAssigned.mockReset();
    recordCorrection.mockReset();

    findCorrection.mockResolvedValue(null);
    findUser.mockResolvedValue({ role: { name: "staff" } });
    findProductionSetting.mockResolvedValue({
      staff_lookback_days: 7,
      admin_lookback_days: 30,
    });
    isAssigned.mockResolvedValue(true);
    findGrades.mockResolvedValue([{ id: 1, code: "TB" }]);
    findEggItem.mockResolvedValue({ id: "egg-item" });
    applyStock.mockResolvedValue({ ok: true });
    transaction.mockImplementation(
      async (fn: (tx: {
        dailyProduction: { delete: typeof deleteProduction };
        dailyProductionItem: { deleteMany: typeof deleteItems };
      }) => Promise<string>) =>
        fn({
          dailyProduction: { delete: deleteProduction },
          dailyProductionItem: { deleteMany: deleteItems },
        }),
    );
    recordCorrection.mockResolvedValue({
      ok: true,
      idempotent: false,
      correctionId: "corr-new",
    });
  });

  test("returns idempotent result when clientMutationId already exists", async () => {
    findCorrection.mockResolvedValue({ id: "corr-existing" });

    const result = await deleteDailyProduction(
      "tenant-1",
      "user-1",
      "rec-1",
      {
        reason: "Salah input",
        clientMutationId: "550e8400-e29b-41d4-a716-446655440000",
      },
    );

    expect(result).toEqual({
      ok: true,
      correctionId: "corr-existing",
      idempotent: true,
    });
    expect(findProduction).not.toHaveBeenCalled();
  });

  test("returns 404 when record not found", async () => {
    findProduction.mockResolvedValue(null);

    const result = await deleteDailyProduction("tenant-1", "user-1", "rec-1", {
      reason: "Salah input",
    });

    expect(result).toEqual({
      ok: false,
      error: "Catatan produksi tidak ditemukan.",
      status: 404,
    });
    expect(transaction).not.toHaveBeenCalled();
  });

  test("reverses egg stock, deletes row + items, records correction audit", async () => {
    findProduction.mockResolvedValue(existingRecord);

    const result = await deleteDailyProduction("tenant-1", "user-1", "rec-1", {
      reason: "Salah input",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.idempotent).toBe(false);

    expect(applyStock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        itemId: "egg-item",
        locationId: "loc-1",
        quantity: 10,
        allowNegative: true,
      }),
    );
    expect(deleteItems).toHaveBeenCalledWith({
      where: { production_id: "rec-1" },
    });
    expect(deleteProduction).toHaveBeenCalledWith({ where: { id: "rec-1" } });

    const calls = recordCorrection.mock.calls as unknown as Array<[CorrectionArgs]>;
    const call = calls[0]?.[0];
    expect(call?.reason).toBe("Salah input");
    expect(call?.changes).toContainEqual({
      component: "production",
      recordId: "rec-1",
      field: "TB",
      before: 10,
      after: null,
    });
    expect(call?.changes).toContainEqual({
      component: "production",
      recordId: "rec-1",
      field: "weight",
      before: 62,
      after: null,
    });
  });

  test("skips stock reversal when tb is 0", async () => {
    findProduction.mockResolvedValue({ ...existingRecord, tb: 0, weight: null });

    const result = await deleteDailyProduction("tenant-1", "user-1", "rec-1", {
      reason: "Salah input",
    });

    expect(result.ok).toBe(true);
    expect(applyStock).not.toHaveBeenCalled();
  });
});
