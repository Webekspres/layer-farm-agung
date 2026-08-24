import { beforeEach, describe, expect, mock, test } from "bun:test";
import { shiftBusinessDate, startOfTodayBusiness } from "@/lib/business-date";

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
const findConsumption = mock(() =>
  Promise.resolve(null as null | {
    id: string;
    cage_id: string;
    item_id: string;
    quantity: number;
    notes: string | null;
    record_date: Date;
    cage: { location_id: string; cycle_settings: Array<{ start_date: Date; end_date: Date | null }> };
  }),
);
const deleteConsumption = mock(() => Promise.resolve({}));
const applyStock = mock(() => Promise.resolve({ ok: true as const }));
const transaction = mock(
  async (fn: (tx: { feedConsumption: { delete: typeof deleteConsumption } }) => Promise<string>) =>
    fn({ feedConsumption: { delete: deleteConsumption } }),
);

mock.module("@/lib/prisma", () => ({
  default: {
    dailyInputCorrection: { findUnique: findCorrection },
    user: { findUnique: findUser },
    tenantProductionSetting: { findUnique: findProductionSetting },
    feedConsumption: { findFirst: findConsumption },
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

const { deleteFeedConsumption } = await import(
  "@/features/production/services/delete-feed-consumption"
);

/** Kemarin relatif terhadap hari ini — selalu dalam jendela lookback 7 hari (staff). */
const RECORD_DATE = shiftBusinessDate(startOfTodayBusiness(), -1);

const existingRecord = {
  id: "rec-1",
  cage_id: "cage-1",
  item_id: "feed-item",
  quantity: 40,
  notes: "Pakan pagi",
  record_date: RECORD_DATE,
  cage: {
    location_id: "loc-1",
    cycle_settings: [{ start_date: new Date("2026-01-01"), end_date: null }],
  },
};

describe("deleteFeedConsumption", () => {
  beforeEach(() => {
    findCorrection.mockReset();
    findUser.mockReset();
    findProductionSetting.mockReset();
    findConsumption.mockReset();
    deleteConsumption.mockReset();
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
    applyStock.mockResolvedValue({ ok: true });
    transaction.mockImplementation(
      async (fn: (tx: { feedConsumption: { delete: typeof deleteConsumption } }) => Promise<string>) =>
        fn({ feedConsumption: { delete: deleteConsumption } }),
    );
    recordCorrection.mockResolvedValue({
      ok: true,
      idempotent: false,
      correctionId: "corr-new",
    });
  });

  test("returns 404 when record not found", async () => {
    findConsumption.mockResolvedValue(null);

    const result = await deleteFeedConsumption("tenant-1", "user-1", "rec-1", {
      reason: "Salah input",
    });

    expect(result).toEqual({
      ok: false,
      error: "Catatan konsumsi pakan tidak ditemukan.",
      status: 404,
    });
    expect(transaction).not.toHaveBeenCalled();
  });

  test("returns feed stock and records correction audit on delete", async () => {
    findConsumption.mockResolvedValue(existingRecord);

    const result = await deleteFeedConsumption("tenant-1", "user-1", "rec-1", {
      reason: "Salah input",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(applyStock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        itemId: "feed-item",
        locationId: "loc-1",
        quantity: 40,
      }),
    );
    expect(deleteConsumption).toHaveBeenCalledWith({ where: { id: "rec-1" } });

    const calls = recordCorrection.mock.calls as unknown as Array<[CorrectionArgs]>;
    const call = calls[0]?.[0];
    expect(call?.changes).toContainEqual({
      component: "feed",
      recordId: "rec-1",
      field: "quantity",
      before: 40,
      after: null,
    });
    expect(call?.changes).toContainEqual({
      component: "feed",
      recordId: "rec-1",
      field: "notes",
      before: "Pakan pagi",
      after: null,
    });
  });
});
