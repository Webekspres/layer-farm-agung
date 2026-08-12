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
    cage: { location_id: string };
  }),
);
const findEggItem = mock(() => Promise.resolve(null as null | { id: string }));
const updateProduction = mock(() => Promise.resolve({}));
const transaction = mock(
  async (fn: (tx: {
    dailyProduction: { update: typeof updateProduction };
  }) => Promise<string>) =>
    fn({
      dailyProduction: { update: updateProduction },
    }),
);

mock.module("@/lib/prisma", () => ({
  default: {
    dailyInputCorrection: { findUnique: findCorrection },
    dailyProduction: { findFirst: findProduction, update: mock(() => Promise.resolve({})) },
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

describe("updateDailyProduction", () => {
  beforeEach(() => {
    findCorrection.mockReset();
    findProduction.mockReset();
    findEggItem.mockReset();
    transaction.mockReset();
    isAssigned.mockReset();
    recordCorrection.mockReset();

    findCorrection.mockResolvedValue(null);
    isAssigned.mockResolvedValue(true);
    findEggItem.mockResolvedValue(null);
    transaction.mockImplementation(
      async (fn: (tx: {
        dailyProduction: { update: typeof updateProduction };
      }) => Promise<string>) =>
        fn({
          dailyProduction: { update: updateProduction },
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
        tb: 10,
        tr: 0,
        tp: 0,
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

  test("records before/after changes and requires a real delta", async () => {
    findProduction.mockResolvedValue({
      id: "rec-1",
      cage_id: "cage-1",
      record_date: new Date("2026-08-12"),
      tb: 10,
      tr: 0,
      tp: 0,
      cage: { location_id: "loc-1" },
    });

    const noChange = await updateDailyProduction("tenant-1", "user-1", "rec-1", {
      tb: 10,
      tr: 0,
      tp: 0,
      reason: "Salah hitung",
    });
    expect(noChange.ok).toBe(false);

    const result = await updateDailyProduction("tenant-1", "user-1", "rec-1", {
      tb: 12,
      tr: 0,
      tp: 0,
      reason: "Salah hitung",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.idempotent).toBe(false);
    expect(result.correctionId).toBe("corr-new");
    expect(recordCorrection).toHaveBeenCalled();
    const call = recordCorrection.mock.calls[0]?.[0] as {
      reason: string;
      changes: Array<{ field: string; before: number; after: number }>;
    };
    expect(call.reason).toBe("Salah hitung");
    expect(call.changes).toEqual([
      {
        component: "production",
        recordId: "rec-1",
        field: "tb",
        before: 10,
        after: 12,
      },
    ]);
  });
});
