import { isUserAssignedToCage } from "@/features/cages/services/is-user-assigned-to-cage";
import { applyStockMutation } from "@/features/inventory/services/apply-stock-mutation";
import { StockMutationType } from "@/features/inventory/lib/stock-mutation-types";
import {
  resolveUserRoleName,
  validateOperationalInputDate,
} from "@/features/production/lib/input-window";
import type { CorrectionChange } from "@/features/production/schemas/correction-meta";
import type { UpdateMedicalRecordInput } from "@/features/production/schemas/update-medical-record";
import { recordCorrectionEvent } from "@/features/production/services/record-correction-event";
import prisma from "@/lib/prisma";

export type UpdateMedicalRecordResult =
  | { ok: true; correctionId: string; idempotent: boolean }
  | { ok: false; error: string; status: 400 | 403 | 404 };

class StockError extends Error {}

export async function updateMedicalRecord(
  tenantId: string,
  userId: string,
  recordId: string,
  input: UpdateMedicalRecordInput,
): Promise<UpdateMedicalRecordResult> {
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

  const existing = await prisma.medicalRecord.findFirst({
    where: { id: recordId, cage: { location: { tenant_id: tenantId } } },
    select: {
      id: true,
      cage_id: true,
      item_id: true,
      quantity_used: true,
      indication: true,
      sick_population: true,
      mortality_count: true,
      medicine_name: true,
      dosage_and_duration: true,
      application_method: true,
      treatment_notes: true,
      treatment_date: true,
      cage: {
        select: {
          location_id: true,
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
      error: "Catatan pengobatan tidak ditemukan.",
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
    recordDate: existing.treatment_date,
    cycle: existing.cage.cycle_settings[0] ?? null,
  });
  if (!windowCheck.ok) {
    return { ok: false, error: windowCheck.error, status: 400 };
  }

  if (input.quantityUsed != null && !existing.item_id) {
    return {
      ok: false,
      error: "Catatan ini tidak terkait item inventori.",
      status: 400,
    };
  }

  const oldQty = existing.quantity_used ?? 0;
  const newQty = existing.item_id ? (input.quantityUsed ?? oldQty) : 0;
  const delta = newQty - oldQty;
  const nextNotes = input.treatmentNotes ?? null;

  const changes: CorrectionChange[] = [];
  const push = (
    field: string,
    before: string | number | null,
    after: string | number | null,
  ) => {
    if (before !== after) {
      changes.push({
        component: "medical",
        recordId,
        field,
        before,
        after,
      });
    }
  };

  push("indication", existing.indication, input.indication);
  push("sickPopulation", existing.sick_population, input.sickPopulation);
  push("mortalityCount", existing.mortality_count, input.mortalityCount);
  push("medicineName", existing.medicine_name, input.medicineName);
  push("dosageAndDuration", existing.dosage_and_duration, input.dosageAndDuration);
  push("applicationMethod", existing.application_method, input.applicationMethod);
  push("treatmentNotes", existing.treatment_notes, nextNotes);
  if (existing.item_id) {
    push("quantityUsed", oldQty, newQty);
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
      await tx.medicalRecord.update({
        where: { id: recordId },
        data: {
          indication: input.indication,
          sick_population: input.sickPopulation,
          mortality_count: input.mortalityCount,
          medicine_name: input.medicineName,
          quantity_used: existing.item_id ? newQty : null,
          dosage_and_duration: input.dosageAndDuration,
          application_method: input.applicationMethod,
          treatment_notes: nextNotes,
        },
      });

      if (existing.item_id && delta !== 0) {
        const result = await applyStockMutation(tx, {
          itemId: existing.item_id,
          locationId: existing.cage.location_id,
          mutationType:
            delta > 0
              ? StockMutationType.OUT_MEDICAL
              : StockMutationType.IN_ADJUSTMENT,
          quantity: Math.abs(delta),
          referenceId: recordId,
        });

        if (!result.ok) {
          throw new StockError(result.error);
        }
      }

      const recorded = await recordCorrectionEvent(
        {
          tenantId,
          cageId: existing.cage_id,
          recordDate: existing.treatment_date,
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
  } catch (error) {
    if (error instanceof StockError) {
      return { ok: false, error: error.message, status: 400 };
    }
    return {
      ok: false,
      error: "Gagal memperbarui catatan pengobatan.",
      status: 400,
    };
  }
}
