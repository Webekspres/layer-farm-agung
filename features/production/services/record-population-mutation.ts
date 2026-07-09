import { resolveActiveCyclePopulation } from "@/features/cages/services/resolve-active-cycle-population";
import { isUserAssignedToCage } from "@/features/cages/services/is-user-assigned-to-cage";
import {
  computeCyclePopulation,
  isPopulationDecreaseType,
} from "@/features/cages/lib/compute-cycle-population";
import type { PopulationMutationInput } from "@/features/production/schemas/population-mutation";
import { validateOperationalBusinessDate, normalizeBusinessDate } from "@/lib/business-date";
import prisma from "@/lib/prisma";

export type RecordPopulationMutationResult =
  | { ok: true }
  | { ok: false; error: string };


export async function recordPopulationMutation(
  tenantId: string,
  userId: string,
  input: PopulationMutationInput,
): Promise<RecordPopulationMutationResult> {
  const cage = await prisma.cage.findFirst({
    where: {
      id: input.cageId,
      location: { tenant_id: tenantId },
    },
    select: { id: true, status: true },
  });

  if (!cage) {
    return { ok: false, error: "Kandang tidak ditemukan di tenant ini." };
  }

  const assigned = await isUserAssignedToCage(userId, input.cageId);
  if (!assigned) {
    return { ok: false, error: "Anda tidak ditugaskan ke kandang ini." };
  }

  if (cage.status !== "Active") {
    return { ok: false, error: "Kandang tidak aktif." };
  }

  const dateCheck = validateOperationalBusinessDate(input.recordDate);
  if (!dateCheck.ok) {
    return { ok: false, error: dateCheck.error };
  }

  const recordDate = dateCheck.date;

  if (isPopulationDecreaseType(input.mutationType)) {
    const current = await resolveActiveCyclePopulation(
      input.cageId,
      recordDate,
    );

    if (current === null) {
      return { ok: false, error: "Kandang belum memiliki siklus aktif." };
    }

    if (input.quantity > current) {
      return {
        ok: false,
        error: `Jumlah mutasi melebihi populasi aktif (${current.toLocaleString("id-ID")} ekor).`,
      };
    }
  }

  try {
    await prisma.populationMutation.create({
      data: {
        cage_id: input.cageId,
        user_id: userId,
        mutation_type: input.mutationType,
        quantity: input.quantity,
        notes: input.notes ?? null,
        record_date: recordDate,
        is_synced: true,
      },
    });
  } catch {
    return { ok: false, error: "Gagal menyimpan mutasi populasi." };
  }

  return { ok: true };
}

/**
 * Validates an update to an existing mutation without double-counting the row.
 */
export async function validatePopulationMutationUpdate(
  cageId: string,
  recordId: string,
  mutationType: string,
  quantity: number,
  recordDate: Date,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isPopulationDecreaseType(mutationType)) {
    return { ok: true };
  }

  const cycle = await prisma.cycleSetting.findFirst({
    where: { cage_id: cageId, status: "Active" },
    select: { initial_population: true },
  });

  if (!cycle) {
    return { ok: false, error: "Kandang belum memiliki siklus aktif." };
  }

  const mutations = await prisma.populationMutation.findMany({
    where: {
      cage_id: cageId,
      id: { not: recordId },
      record_date: { lte: normalizeBusinessDate(recordDate) },
    },
    select: {
      mutation_type: true,
      quantity: true,
      record_date: true,
    },
  });

  const current = computeCyclePopulation(
    cycle.initial_population,
    mutations,
    recordDate,
  );

  if (quantity > current) {
    return {
      ok: false,
      error: `Jumlah mutasi melebihi populasi aktif (${current.toLocaleString("id-ID")} ekor).`,
    };
  }

  return { ok: true };
}
