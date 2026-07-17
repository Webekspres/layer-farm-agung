import { beforeEach, describe, expect, mock, test } from "bun:test";
import {
  completeVaccination,
  type CompleteVaccinationOptions,
} from "./complete-vaccination";
import { StockMutationType } from "@/features/inventory/lib/stock-mutation-types";
import type { CompleteVaccinationInput } from "@/features/health/schemas/vaccine-schedule";

/**
 * These tests inject fakes via `options.deps` rather than `mock.module`,
 * because Bun's `mock.module` replaces a module for the whole test run (no
 * per-file restore) and would otherwise break every other test importing the
 * real `@/lib/prisma` / `apply-stock-mutation`.
 */

type ScheduleRow = {
  id: string;
  status: string;
  cage_id: string;
  item_id: string;
  notes: string | null;
  cage: { location_id: string };
  item: { type: string };
};

type StockMutationResult =
  | { ok: true; newQuantity: number; lowStock: boolean; minStockAlert: number }
  | { ok: false; error: string };

const findUniqueClientMutation = mock(() =>
  Promise.resolve(null as { id: string } | null),
);
const findFirstSchedule = mock(() =>
  Promise.resolve(null as ScheduleRow | null),
);
const updateMany = mock(() =>
  Promise.resolve({ count: 1 }),
);

const isUserAssignedToCage = mock(() =>
  Promise.resolve(true),
);
const applyStockMutation = mock(
  (): Promise<StockMutationResult> =>
    Promise.resolve({
      ok: true,
      newQuantity: 80,
      lowStock: false,
      minStockAlert: 100,
    }),
);

const fakePrisma = {
  vaccineSchedule: {
    findUnique: findUniqueClientMutation,
    findFirst: findFirstSchedule,
  },
  $transaction: async (fn: (tx: unknown) => Promise<unknown>) =>
    fn({ vaccineSchedule: { updateMany } }),
};

const deps = {
  prisma: fakePrisma,
  applyStockMutation,
  isUserAssignedToCage,
} as unknown as CompleteVaccinationOptions["deps"];

const BASE_SCHEDULE: ScheduleRow = {
  id: "sched-1",
  status: "Pending",
  cage_id: "cage-1",
  item_id: "item-1",
  notes: null,
  cage: { location_id: "loc-1" },
  item: { type: "Vaccine" },
};

function baseInput(
  overrides: Partial<CompleteVaccinationInput> = {},
): CompleteVaccinationInput {
  return {
    scheduleId: "sched-1",
    quantityUsed: 5,
    notes: undefined,
    clientMutationId: undefined,
    fromSync: false,
    ...overrides,
  };
}

describe("completeVaccination", () => {
  beforeEach(() => {
    findUniqueClientMutation.mockReset();
    findUniqueClientMutation.mockResolvedValue(null);
    findFirstSchedule.mockReset();
    findFirstSchedule.mockResolvedValue(BASE_SCHEDULE);
    updateMany.mockReset();
    updateMany.mockResolvedValue({ count: 1 });
    isUserAssignedToCage.mockReset();
    isUserAssignedToCage.mockResolvedValue(true);
    applyStockMutation.mockReset();
    applyStockMutation.mockResolvedValue({
      ok: true,
      newQuantity: 80,
      lowStock: false,
      minStockAlert: 100,
    });
  });

  test("fails when schedule not found in tenant", async () => {
    findFirstSchedule.mockResolvedValue(null);

    const result = await completeVaccination("tenant-1", "user-1", baseInput(), {
      deps,
    });

    expect(result.ok).toBe(false);
  });

  test("fails when schedule is not Pending", async () => {
    findFirstSchedule.mockResolvedValue({ ...BASE_SCHEDULE, status: "Completed" });

    const result = await completeVaccination("tenant-1", "user-1", baseInput(), {
      deps,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("sudah diselesaikan");
    expect(applyStockMutation).not.toHaveBeenCalled();
  });

  test("fails when item is not a Vaccine type", async () => {
    findFirstSchedule.mockResolvedValue({
      ...BASE_SCHEDULE,
      item: { type: "Medicine" },
    });

    const result = await completeVaccination("tenant-1", "user-1", baseInput(), {
      deps,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("bukan vaksin");
  });

  test("fails when staff is not assigned to the cage", async () => {
    isUserAssignedToCage.mockResolvedValue(false);

    const result = await completeVaccination("tenant-1", "user-1", baseInput(), {
      deps,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("tidak ditugaskan");
    expect(applyStockMutation).not.toHaveBeenCalled();
  });

  test("admin path skips assignment check via skipAssignmentCheck", async () => {
    isUserAssignedToCage.mockResolvedValue(false);

    const result = await completeVaccination(
      "tenant-1",
      "admin-1",
      baseInput(),
      { skipAssignmentCheck: true, deps },
    );

    expect(result.ok).toBe(true);
    expect(isUserAssignedToCage).not.toHaveBeenCalled();
  });

  test("applies OUT_VACCINE mutation at the schedule's cage location and marks Completed", async () => {
    const result = await completeVaccination(
      "tenant-1",
      "user-1",
      baseInput({ quantityUsed: 12.5 }),
      { deps },
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.remainingStock).toBe(80);
    expect(result.lowStock).toBe(false);

    expect(applyStockMutation).toHaveBeenCalledTimes(1);
    const [, params] = applyStockMutation.mock.calls[0];
    expect(params.itemId).toBe("item-1");
    expect(params.locationId).toBe("loc-1");
    expect(params.mutationType).toBe(StockMutationType.OUT_VACCINE);
    expect(params.quantity).toBe(12.5);
    expect(params.referenceId).toBe("sched-1");

    expect(updateMany).toHaveBeenCalledTimes(1);
    const [updateArgs] = updateMany.mock.calls[0];
    expect(updateArgs.data.status).toBe("Completed");
    expect(updateArgs.data.quantity_used).toBe(12.5);
  });

  test("fails without completing when stock is insufficient", async () => {
    applyStockMutation.mockResolvedValue({
      ok: false,
      error: "Stok tidak mencukupi untuk jumlah yang dimasukkan.",
    });

    const result = await completeVaccination(
      "tenant-1",
      "user-1",
      baseInput({ quantityUsed: 999 }),
      { deps },
    );

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("tidak mencukupi");
  });

  test("returns idempotent result when clientMutationId already recorded", async () => {
    findUniqueClientMutation.mockResolvedValue({ id: "sched-1" });

    const result = await completeVaccination(
      "tenant-1",
      "user-1",
      baseInput({ clientMutationId: "11111111-1111-1111-1111-111111111111" }),
      { deps },
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.idempotent).toBe(true);
    expect(findFirstSchedule).not.toHaveBeenCalled();
  });

  test("fails with a concurrency error when another request already completed it", async () => {
    updateMany.mockResolvedValue({ count: 0 });

    const result = await completeVaccination("tenant-1", "user-1", baseInput(), {
      deps,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("diselesaikan oleh proses lain");
    expect(applyStockMutation).not.toHaveBeenCalled();
  });
});
