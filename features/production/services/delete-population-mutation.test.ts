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
const findMutation = mock(() =>
  Promise.resolve(null as null | {
    id: string;
    cage_id: string;
    record_date: Date;
    mutation_type: string;
    quantity: number;
    notes: string | null;
    cage: { cycle_settings: Array<{ start_date: Date; end_date: Date | null }> };
  }),
);
const findCycle = mock(() =>
  Promise.resolve(null as null | { initial_population: number }),
);
const findMutations = mock(() =>
  Promise.resolve([] as Array<{ mutation_type: string; quantity: number; record_date: Date }>),
);
const deleteMutation = mock(() => Promise.resolve({}));
const transaction = mock(
  async (fn: (tx: { populationMutation: { delete: typeof deleteMutation } }) => Promise<string>) =>
    fn({ populationMutation: { delete: deleteMutation } }),
);

mock.module("@/lib/prisma", () => ({
  default: {
    dailyInputCorrection: { findUnique: findCorrection },
    user: { findUnique: findUser },
    tenantProductionSetting: { findUnique: findProductionSetting },
    populationMutation: { findFirst: findMutation, findMany: findMutations },
    cycleSetting: { findFirst: findCycle },
    $transaction: transaction,
  },
}));

const isAssigned = mock(() => Promise.resolve(true));
mock.module("@/features/cages/services/is-user-assigned-to-cage", () => ({
  isUserAssignedToCage: isAssigned,
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

const { deletePopulationMutation } = await import(
  "@/features/production/services/delete-population-mutation"
);

/** Relatif terhadap hari ini — selalu dalam jendela lookback 7 hari (staff). */
const RECORD_DATE = shiftBusinessDate(startOfTodayBusiness(), -1);
const EARLIER_DATE = shiftBusinessDate(RECORD_DATE, -2);

const baseRecord = {
  id: "rec-1",
  cage_id: "cage-1",
  record_date: RECORD_DATE,
  mutation_type: "Mati",
  quantity: 5,
  notes: null,
  cage: {
    cycle_settings: [{ start_date: new Date("2026-01-01"), end_date: null }],
  },
};

describe("deletePopulationMutation", () => {
  beforeEach(() => {
    findCorrection.mockReset();
    findUser.mockReset();
    findProductionSetting.mockReset();
    findMutation.mockReset();
    findCycle.mockReset();
    findMutations.mockReset();
    deleteMutation.mockReset();
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
    transaction.mockImplementation(
      async (fn: (tx: { populationMutation: { delete: typeof deleteMutation } }) => Promise<string>) =>
        fn({ populationMutation: { delete: deleteMutation } }),
    );
    recordCorrection.mockResolvedValue({
      ok: true,
      idempotent: false,
      correctionId: "corr-new",
    });
  });

  test("returns 404 when record not found", async () => {
    findMutation.mockResolvedValue(null);

    const result = await deletePopulationMutation("tenant-1", "user-1", "rec-1", {
      reason: "Salah input",
    });

    expect(result).toEqual({
      ok: false,
      error: "Catatan mutasi populasi tidak ditemukan.",
      status: 404,
    });
  });

  test("deletes decrease-type mutation without population guard", async () => {
    findMutation.mockResolvedValue(baseRecord);

    const result = await deletePopulationMutation("tenant-1", "user-1", "rec-1", {
      reason: "Salah input",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(findCycle).not.toHaveBeenCalled();
    expect(deleteMutation).toHaveBeenCalledWith({ where: { id: "rec-1" } });

    const calls = recordCorrection.mock.calls as unknown as Array<[CorrectionArgs]>;
    const call = calls[0]?.[0];
    expect(call?.changes).toContainEqual({
      component: "population",
      recordId: "rec-1",
      field: "mutationType",
      before: "Mati",
      after: null,
    });
    expect(call?.changes).toContainEqual({
      component: "population",
      recordId: "rec-1",
      field: "quantity",
      before: 5,
      after: null,
    });
  });

  test("rejects deleting increase-type mutation that would drive population negative", async () => {
    // Populasi termasuk baris ini = 100 - 300 (Mati) + 150 (Masuk) = -50 → 0.
    // Menghapus Masuk 150 dari populasi 0 → negatif → tolak.
    findMutation.mockResolvedValue({
      ...baseRecord,
      mutation_type: "Masuk",
      quantity: 150,
    });
    findCycle.mockResolvedValue({ initial_population: 100 });
    findMutations.mockResolvedValue([
      { mutation_type: "Mati", quantity: 300, record_date: EARLIER_DATE },
      { mutation_type: "Masuk", quantity: 150, record_date: RECORD_DATE },
    ]);

    const result = await deletePopulationMutation("tenant-1", "user-1", "rec-1", {
      reason: "Salah input",
    });

    expect(result).toEqual({
      ok: false,
      error: "Menghapus mutasi ini akan membuat populasi kandang negatif.",
      status: 400,
    });
    expect(transaction).not.toHaveBeenCalled();
  });

  test("allows deleting increase-type mutation when population stays non-negative", async () => {
    // Populasi aktif 300 (termasuk Masuk 150) → 150 tersisa setelah dihapus.
    findMutation.mockResolvedValue({
      ...baseRecord,
      mutation_type: "Masuk",
      quantity: 150,
    });
    findCycle.mockResolvedValue({ initial_population: 150 });
    findMutations.mockResolvedValue([
      { mutation_type: "Masuk", quantity: 150, record_date: RECORD_DATE },
    ]);

    const result = await deletePopulationMutation("tenant-1", "user-1", "rec-1", {
      reason: "Salah input",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(deleteMutation).toHaveBeenCalled();
  });
});
