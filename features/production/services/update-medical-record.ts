import { isUserAssignedToCage } from "@/features/cages/services/is-user-assigned-to-cage";
import { applyStockMutation } from "@/features/inventory/services/apply-stock-mutation";
import { StockMutationType } from "@/features/inventory/lib/stock-mutation-types";
import type { UpdateMedicalRecordInput } from "@/features/production/schemas/update-medical-record";
import prisma from "@/lib/prisma";

export type UpdateMedicalRecordResult =
  | { ok: true }
  | { ok: false; error: string; status: 400 | 403 | 404 };

class StockError extends Error {}

export async function updateMedicalRecord(
  tenantId: string,
  userId: string,
  recordId: string,
  input: UpdateMedicalRecordInput,
): Promise<UpdateMedicalRecordResult> {
  const existing = await prisma.medicalRecord.findFirst({
    where: { id: recordId, cage: { location: { tenant_id: tenantId } } },
    select: {
      id: true,
      cage_id: true,
      item_id: true,
      quantity_used: true,
      cage: { select: { location_id: true } },
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

  // The linked item itself isn't editable, only how much was used — a record
  // without a linked item can't retroactively gain one via this endpoint.
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

  try {
    await prisma.$transaction(async (tx) => {
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
          treatment_notes: input.treatmentNotes ?? null,
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
    });
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

  return { ok: true };
}
