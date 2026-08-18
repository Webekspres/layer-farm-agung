import { beforeEach, describe, expect, mock, test } from "bun:test";

const findCorrection = mock(() => Promise.resolve(null as null | { id: string }));
const findProduction = mock(() =>
  Promise.resolve(null as null | {
    id: string;
    cage_id: string;
    record_date: Date;
    tb: number;
    tr: number;
    tp: number;
    weight: number | null;
    cage: { location_id: string };
    items: Array<{ egg_grade_id: number; quantity: number }>;
  }),
);
const findGrades = mock(() =>
  Promise.resolve(
    [] as Array<{ id: number; code: string | null; is_active: boolean }>,
  ),
);
const findEggItem = mock(() => Promise.resolve(null as null | { id: string }));
const updateProduction = mock(() => Promise.resolve({}));
const deleteItems = mock(() => Promise.resolve({ count: 0 }));
const createItems = mock(() => Promise.resolve({ count: 0 }));
const transaction = mock(
  async (fn: (tx: {
    dailyProduction: { update: typeof updateProduction };
    dailyProductionItem: {
      deleteMany: typeof deleteItems;
      createMany: typeof createItems;
    };
  }) => Promise<string>) =>
    fn({
      dailyProduction: { update: updateProduction },
      dailyProductionItem: { deleteMany: deleteItems, createMany: createItems },
    }),
);

mock.module("@/lib/prisma", () => ({
  default: {
    dailyInputCorrection: { findUnique: findCorrection },
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
  applyStockMutation: mock(() => Promise.resolve({ ok: true })),
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

const { updateDailyProduction } = await import(
  "@/features/production/services/update-daily-production"
);

const TB_GRADE = { id: 1, code: "TB", is_active: true };

const existingRecord = {
  id: "rec-1",
  cage_id: "cage-1",
  record_date: new Date("2026-08-12"),
  tb: 10,
  tr: 0,
  tp: 0,
  weight: null,
  cage: { location_id: "loc-1" },
  items: [{ egg_grade_id: 1, quantity: 10 }],
};

describe("updateDailyProduction", () => {
  beforeEach(() => {
    findCorrection.mockReset();
    findProduction.mockReset();
    findGrades.mockReset();
    findEggItem.mockReset();
    transaction.mockReset();
    isAssigned.mockReset();
    recordCorrection.mockReset();
    updateProduction.mockReset();
    deleteItems.mockReset();
    createItems.mockReset();

    findCorrection.mockResolvedValue(null);
    isAssigned.mockResolvedValue(true);
    findEggItem.mockResolvedValue(null);
    transaction.mockImplementation(
      async (fn: (tx: {
        dailyProduction: { update: typeof updateProduction };
        dailyProductionItem: {
          deleteMany: typeof deleteItems;
          createMany: typeof createItems;
        };
      }) => Promise<string>) =>
        fn({
          dailyProduction: { update: updateProduction },
          dailyProductionItem: {
            deleteMany: deleteItems,
            createMany: createItems,
          },
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

    const result = await updateDailyProduction(
      "tenant-1",
      "user-1",
      "rec-1",
      {
        entries: [{ eggGradeId: 1, quantity: 12 }],
        reason: "Salah hitung",
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

  test("records before/after changes per grade and requires a real delta", async () => {
    findProduction.mockResolvedValue(existingRecord);
    findGrades.mockResolvedValue([TB_GRADE]);

    const noChange = await updateDailyProduction("tenant-1", "user-1", "rec-1", {
      entries: [{ eggGradeId: 1, quantity: 10 }],
      reason: "Salah hitung",
    });
    expect(noChange.ok).toBe(false);

    const result = await updateDailyProduction("tenant-1", "user-1", "rec-1", {
      entries: [{ eggGradeId: 1, quantity: 12 }],
      weight: 62,
      reason: "Salah hitung",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.idempotent).toBe(false);
    expect(result.correctionId).toBe("corr-new");
    expect(recordCorrection).toHaveBeenCalled();
    const calls = recordCorrection.mock.calls as unknown as Array<[CorrectionArgs]>;
    const call = calls[0]?.[0];
    expect(call).toBeDefined();
    if (!call) return;
    expect(call.reason).toBe("Salah hitung");
    expect(call.changes).toEqual([
      {
        component: "production",
        recordId: "rec-1",
        field: "TB",
        before: 10,
        after: 12,
      },
      {
        component: "production",
        recordId: "rec-1",
        field: "weight",
        before: null,
        after: 62,
      },
    ]);

    expect(deleteItems).toHaveBeenCalledWith({
      where: { production_id: "rec-1" },
    });
    expect(createItems).toHaveBeenCalledWith({
      data: [{ production_id: "rec-1", egg_grade_id: 1, quantity: 12 }],
    });
  });

  test("rejects inactive grade in entries", async () => {
    findProduction.mockResolvedValue(existingRecord);
    findGrades.mockResolvedValue([{ id: 2, code: "TR", is_active: false }]);

    const result = await updateDailyProduction("tenant-1", "user-1", "rec-1", {
      entries: [{ eggGradeId: 2, quantity: 5 }],
      reason: "Koreksi retak",
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe(
      "Terdapat klasifikasi telur yang tidak valid atau nonaktif.",
    );
    expect(transaction).not.toHaveBeenCalled();
  });
});
