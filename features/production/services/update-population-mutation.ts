import { isUserAssignedToCage } from "@/features/cages/services/is-user-assigned-to-cage";
import {
  resolveUserRoleName,
  validateOperationalInputDate,
} from "@/features/production/lib/input-window";
import type { CorrectionChange } from "@/features/production/schemas/correction-meta";
import type { UpdatePopulationMutationInput } from "@/features/production/schemas/update-population-mutation";
import {
  validatePopulationMutationUpdate,
} from "@/features/production/services/record-population-mutation";
import { recordCorrectionEvent } from "@/features/production/services/record-correction-event";
import prisma from "@/lib/prisma";

export type UpdatePopulationMutationResult =
  | { ok: true; correctionId: string; idempotent: boolean }
  | { ok: false; error: string; status: 400 | 403 | 404 };

export async function updatePopulationMutation(
  tenantId: string,
  userId: string,
  recordId: string,
  input: UpdatePopulationMutationInput,
): Promise<UpdatePopulationMutationResult> {
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

  if (input.quantity > 0) {
    const validation = await validatePopulationMutationUpdate(
      existing.cage_id,
      recordId,
      input.mutationType,
      input.quantity,
      existing.record_date,
    );

    if (!validation.ok) {
      return { ok: false, error: validation.error, status: 400 };
    }
  }

  const nextNotes = input.notes ?? null;
  const changes: CorrectionChange[] = [];
  if (existing.mutation_type !== input.mutationType) {
    changes.push({
      component: "population",
      recordId,
      field: "mutationType",
      before: existing.mutation_type,
      after: input.mutationType,
    });
  }
  if (existing.quantity !== input.quantity) {
    changes.push({
      component: "population",
      recordId,
      field: "quantity",
      before: existing.quantity,
      after: input.quantity,
    });
  }
  if ((existing.notes ?? null) !== nextNotes) {
    changes.push({
      component: "population",
      recordId,
      field: "notes",
      before: existing.notes,
      after: nextNotes,
    });
  }

  if (changes.length === 0) {
    return {
      ok: false,
      error: "Tidak ada perubahan nilai untuk dikoreksi.",
      status: 400,
    };
  }

  try {
    const correctionId = await prisma.$transaction(async (tx) => {
      await tx.populationMutation.update({
        where: { id: recordId },
        data: {
          mutation_type: input.mutationType,
          quantity: input.quantity,
          notes: nextNotes,
        },
      });

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
      error: "Gagal memperbarui mutasi populasi.",
      status: 400,
    };
  }
}
