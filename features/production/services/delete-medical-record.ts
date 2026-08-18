import { isUserAssignedToCage } from "@/features/cages/services/is-user-assigned-to-cage";
import { applyStockMutation } from "@/features/inventory/services/apply-stock-mutation";
import { StockMutationType } from "@/features/inventory/lib/stock-mutation-types";
import {
  resolveUserRoleName,
  validateOperationalInputDate,
} from "@/features/production/lib/input-window";
import type { CorrectionChange } from "@/features/production/schemas/correction-meta";
import type { DeleteRecordInput } from "@/features/production/schemas/delete-record";
import { recordCorrectionEvent } from "@/features/production/services/record-correction-event";
import prisma from "@/lib/prisma";

export type DeleteMedicalRecordResult =
  | { ok: true; correctionId: string; idempotent: boolean }
  | { ok: false; error: string; status: 400 | 403 | 404 };

class StockError extends Error {}

export async function deleteMedicalRecord(
  tenantId: string,
  userId: string,
  recordId: string,
  input: DeleteRecordInput,
): Promise<DeleteMedicalRecordResult> {
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
            select: { start_date: true, end_date: true },
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

  const push = (field: string, before: string | number | null) => {
    changes.push({
      component: "medical",
      recordId,
      field,
      before,
      after: null,
    });
  };
  const changes: CorrectionChange[] = [];
  push("indication", existing.indication);
  push("sickPopulation", existing.sick_population);
  push("mortalityCount", existing.mortality_count);
  push("medicineName", existing.medicine_name);
  push("dosageAndDuration", existing.dosage_and_duration);
  push("applicationMethod", existing.application_method);
  push("treatmentNotes", existing.treatment_notes);
  if (existing.item_id) {
    push("quantityUsed", existing.quantity_used ?? 0);
  }

  try {
    const correctionId = await prisma.$transaction(async (tx) => {
      // Obat/vitamin yang dipakai (OUT_MEDICAL saat create) dikembalikan ke stok.
      if (existing.item_id && (existing.quantity_used ?? 0) > 0) {
        const stock = await applyStockMutation(tx, {
          itemId: existing.item_id,
          locationId: existing.cage.location_id,
          mutationType: StockMutationType.IN_ADJUSTMENT,
          quantity: existing.quantity_used ?? 0,
          referenceId: recordId,
        });

        if (!stock.ok) {
          throw new StockError(stock.error);
        }
      }

      await tx.medicalRecord.delete({ where: { id: recordId } });

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
      error: "Gagal menghapus catatan pengobatan.",
      status: 400,
    };
  }
}
