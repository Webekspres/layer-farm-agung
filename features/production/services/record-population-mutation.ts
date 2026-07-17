import { resolveActiveCyclePopulation } from "@/features/cages/services/resolve-active-cycle-population";
import { isUserAssignedToCage } from "@/features/cages/services/is-user-assigned-to-cage";
import {
  computeCyclePopulation,
  isPopulationDecreaseType,
} from "@/features/cages/lib/compute-cycle-population";
import { isPrismaUniqueViolation } from "@/features/production/lib/client-mutation-id";
import type { PopulationMutationInput } from "@/features/production/schemas/population-mutation";
import { validateOperationalBusinessDate, normalizeBusinessDate } from "@/lib/business-date";
import prisma from "@/lib/prisma";

export type RecordPopulationMutationResult =
  | { ok: true; idempotent: boolean; recordId: string }
  | { ok: false; error: string };

export async function recordPopulationMutation(
  tenantId: string,
  userId: string,
  input: PopulationMutationInput,
): Promise<RecordPopulationMutationResult> {
  if (input.clientMutationId) {
    const existing = await prisma.populationMutation.findUnique({
      where: { client_mutation_id: input.clientMutationId },
      select: { id: true },
    });

    if (existing) {
      return { ok: true, idempotent: true, recordId: existing.id };
    }
  }

  const cage = await prisma.cage.findFirst({
    where: {
      id: input.cageId,
      location: { tenant_id: tenantId },
    },
    select: { id: true, name: true, status: true },
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
  const isSynced = !input.fromSync;
  const isPindah = input.mutationType === "Pindah";

  let targetCage: { id: string; name: string } | null = null;

  if (isPindah) {
    const targetValidation = await validateTransferTargetCage(
      tenantId,
      input.cageId,
      input.targetCageId,
    );

    if (!targetValidation.ok) {
      return { ok: false, error: targetValidation.error };
    }

    targetCage = targetValidation.targetCage;
  }

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
    const record = await prisma.$transaction(async (tx) => {
      const created = await tx.populationMutation.create({
        data: {
          cage_id: input.cageId,
          user_id: userId,
          mutation_type: input.mutationType,
          quantity: input.quantity,
          notes: input.notes ?? null,
          record_date: recordDate,
          is_synced: isSynced,
          client_mutation_id: input.clientMutationId ?? null,
          target_cage_id: isPindah ? targetCage!.id : null,
        },
        select: { id: true },
      });

      if (isPindah && targetCage) {
        await tx.populationMutation.create({
          data: {
            cage_id: targetCage.id,
            user_id: userId,
            mutation_type: "Masuk",
            quantity: input.quantity,
            notes: `Transfer dari kandang ${cage.name}.`,
            record_date: recordDate,
            is_synced: isSynced,
          },
        });
      }

      return created;
    });

    return { ok: true, idempotent: false, recordId: record.id };
  } catch (error) {
    if (input.clientMutationId && isPrismaUniqueViolation(error)) {
      const existing = await prisma.populationMutation.findUnique({
        where: { client_mutation_id: input.clientMutationId },
        select: { id: true },
      });

      if (existing) {
        return { ok: true, idempotent: true, recordId: existing.id };
      }
    }

    return { ok: false, error: "Gagal menyimpan mutasi populasi." };
  }
}

export type ValidateTransferTargetCageResult =
  | { ok: true; targetCage: { id: string; name: string } }
  | { ok: false; error: string };

/**
 * Pure rules for the destination cage of a "Pindah" (cross-cage transfer)
 * mutation: must be selected, differ from source, exist in tenant, be
 * active, and have an active cycle to receive the incoming birds. Takes
 * already-fetched data so it can be unit-tested without a database.
 */
export function evaluateTransferTargetCage(
  sourceCageId: string,
  targetCageId: string | undefined,
  targetCage: { id: string; name: string; status: string } | null,
  targetHasActiveCycle: boolean,
): ValidateTransferTargetCageResult {
  if (!targetCageId) {
    return {
      ok: false,
      error: "Kandang tujuan wajib diisi untuk mutasi Pindah.",
    };
  }

  if (targetCageId === sourceCageId) {
    return {
      ok: false,
      error: "Kandang tujuan harus berbeda dari kandang asal.",
    };
  }

  if (!targetCage) {
    return { ok: false, error: "Kandang tujuan tidak ditemukan di tenant ini." };
  }

  if (targetCage.status !== "Active") {
    return { ok: false, error: "Kandang tujuan tidak aktif." };
  }

  if (!targetHasActiveCycle) {
    return {
      ok: false,
      error: "Kandang tujuan belum memiliki siklus aktif.",
    };
  }

  return { ok: true, targetCage: { id: targetCage.id, name: targetCage.name } };
}

/**
 * Validates the destination cage for a "Pindah" mutation against the
 * database, delegating the actual rules to `evaluateTransferTargetCage`.
 */
export async function validateTransferTargetCage(
  tenantId: string,
  sourceCageId: string,
  targetCageId: string | undefined,
): Promise<ValidateTransferTargetCageResult> {
  if (!targetCageId || targetCageId === sourceCageId) {
    return evaluateTransferTargetCage(sourceCageId, targetCageId, null, false);
  }

  const targetCage = await prisma.cage.findFirst({
    where: {
      id: targetCageId,
      location: { tenant_id: tenantId },
    },
    select: { id: true, name: true, status: true },
  });

  const targetHasActiveCycle = targetCage
    ? Boolean(
        await prisma.cycleSetting.findFirst({
          where: { cage_id: targetCage.id, status: "Active" },
          select: { id: true },
        }),
      )
    : false;

  return evaluateTransferTargetCage(
    sourceCageId,
    targetCageId,
    targetCage,
    targetHasActiveCycle,
  );
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
