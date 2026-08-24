import { isUserAssignedToCage } from "@/features/cages/services/is-user-assigned-to-cage";
import {
  computeCyclePopulation,
  isPopulationDecreaseType,
} from "@/features/cages/lib/compute-cycle-population";
import {
  resolveUserRoleName,
  validateOperationalInputDate,
} from "@/features/production/lib/input-window";
import type { CorrectionChange } from "@/features/production/schemas/correction-meta";
import type { DeleteRecordInput } from "@/features/production/schemas/delete-record";
import { recordCorrectionEvent } from "@/features/production/services/record-correction-event";
import { normalizeBusinessDate } from "@/lib/business-date";
import prisma from "@/lib/prisma";

export type DeletePopulationMutationResult =
  | { ok: true; correctionId: string; idempotent: boolean }
  | { ok: false; error: string; status: 400 | 403 | 404 };

export async function deletePopulationMutation(
  tenantId: string,
  userId: string,
  recordId: string,
  input: DeleteRecordInput,
): Promise<DeletePopulationMutationResult> {
  if (input.clientMutationId) {
    const existingCorrection = await prisma.dailyInputCorrection.findUnique({
      where: { client_mutation_id: input.clientMutationId },
      select: { id: true },
    });
    if (existingCorrection) {
      return {
        ok: true,
        correctionId: existingCorrection.id,
        idempotent: true,
      };
    }
  }

  const existing = await prisma.populationMutation.findFirst({
    where: { id: recordId, cage: { location: { tenant_id: tenantId } } },
    select: {
      id: true,
      cage_id: true,
      record_date: true,
      mutation_type: true,
      quantity: true,
      notes: true,
      cage: {
        select: {
          cycle_settings: {
            where: { status: "Active" },
            take: 1,
            select: { start_date: true, go_live_date: true, end_date: true },
          },
        },
      },
    },
  });

  if (!existing) {
    return {
      ok: false,
      error: "Catatan mutasi populasi tidak ditemukan.",
      status: 404,
    };
  }

  const assigned = await isUserAssignedToCage(userId, existing.cage_id);

  if (!assigned) {
    return {
      ok: false,
      error: "Anda tidak ditugaskan ke kandang ini.",
      status: 403,
    };
  }

  const roleName = await resolveUserRoleName(userId);
  const windowCheck = await validateOperationalInputDate({
    tenantId,
    roleName,
    recordDate: existing.record_date,
    cycle: existing.cage.cycle_settings[0] ?? null,
  });
  if (!windowCheck.ok) {
    return { ok: false, error: windowCheck.error, status: 400 };
  }

  // Menghapus mutasi "Masuk" menurunkan populasi — jangan sampai negatif.
  // Populasi dihitung TERMASUK baris ini; jika hasil setelah pengurangan
  // lebih kecil dari quantity, populasi akan negatif → tolak.
  if (!isPopulationDecreaseType(existing.mutation_type)) {
    const cycle = await prisma.cycleSetting.findFirst({
      where: { cage_id: existing.cage_id, status: "Active" },
      select: { initial_population: true, start_date: true, go_live_date: true },
    });

    if (!cycle) {
      return { ok: false, error: "Kandang belum memiliki siklus aktif.", status: 400 };
    }

    const mutations = await prisma.populationMutation.findMany({
      where: {
        cage_id: existing.cage_id,
        record_date: { lte: normalizeBusinessDate(existing.record_date) },
      },
      select: { mutation_type: true, quantity: true, record_date: true },
    });

    const current = computeCyclePopulation(
      cycle.initial_population,
      mutations,
      existing.record_date,
      cycle.go_live_date ?? cycle.start_date,
    );

    if (current < existing.quantity) {
      return {
        ok: false,
        error: "Menghapus mutasi ini akan membuat populasi kandang negatif.",
        status: 400,
      };
    }
  }

  const changes: CorrectionChange[] = [
    {
      component: "population",
      recordId,
      field: "mutationType",
      before: existing.mutation_type,
      after: null,
    },
    {
      component: "population",
      recordId,
      field: "quantity",
      before: existing.quantity,
      after: null,
    },
  ];
  if (existing.notes != null) {
    changes.push({
      component: "population",
      recordId,
      field: "notes",
      before: existing.notes,
      after: null,
    });
  }

  try {
    const correctionId = await prisma.$transaction(async (tx) => {
      await tx.populationMutation.delete({ where: { id: recordId } });

      const recorded = await recordCorrectionEvent(
        {
          tenantId,
          cageId: existing.cage_id,
          recordDate: existing.record_date,
          actorUserId: userId,
          reason: input.reason,
          changes,
          clientMutationId: input.clientMutationId,
        },
        tx,
      );

      if (!recorded.ok) {
        throw new Error(recorded.error);
      }

      return recorded.correctionId;
    });

    return { ok: true, correctionId, idempotent: false };
  } catch {
    return {
      ok: false,
      error: "Gagal menghapus mutasi populasi.",
      status: 400,
    };
  }
}
