import { isUserAssignedToCage } from "@/features/cages/services/is-user-assigned-to-cage";
import { applyStockMutation } from "@/features/inventory/services/apply-stock-mutation";
import { StockMutationType } from "@/features/inventory/lib/stock-mutation-types";
import type { MedicalRecordInput } from "@/features/production/schemas/medical-record";
import { validateOperationalBusinessDate } from "@/lib/business-date";
import prisma from "@/lib/prisma";

export type RecordMedicalRecordResult =
  | { ok: true; lowStock: boolean; remainingStock: number | null }
  | { ok: false; error: string };


class StockError extends Error {}

export async function recordMedicalRecord(
  tenantId: string,
  userId: string,
  input: MedicalRecordInput,
): Promise<RecordMedicalRecordResult> {
  // Verify cage belongs to this tenant
  const cage = await prisma.cage.findFirst({
    where: {
      id: input.cageId,
      location: { tenant_id: tenantId },
    },
    select: { id: true, status: true, location_id: true },
  });

  if (!cage) {
    return { ok: false, error: "Kandang tidak ditemukan di tenant ini." };
  }

  // Verify user is assigned to this cage
  const assigned = await isUserAssignedToCage(userId, input.cageId);
  if (!assigned) {
    return { ok: false, error: "Anda tidak ditugaskan ke kandang ini." };
  }

  // When an inventory item is linked, verify it belongs to the tenant and is a
  // Medicine or Vitamin (vitamin is also used in pengobatan per client).
  if (input.itemId) {
    const item = await prisma.item.findFirst({
      where: { id: input.itemId, tenant_id: tenantId },
      select: { type: true },
    });

    if (!item) {
      return { ok: false, error: "Item obat/vitamin tidak ditemukan di tenant ini." };
    }

    const isMedicalItem = item.type === "Medicine" || item.type === "Vitamin";
    if (!isMedicalItem) {
      return { ok: false, error: "Item yang dipilih bukan obat atau vitamin." };
    }
  }

  const dateCheck = validateOperationalBusinessDate(input.treatmentDate);
  if (!dateCheck.ok) {
    return { ok: false, error: dateCheck.error };
  }

  const treatmentDate = dateCheck.date;

  try {
    const outcome = await prisma.$transaction(async (tx) => {
      const record = await tx.medicalRecord.create({
        data: {
          cage_id: input.cageId,
          user_id: userId,
          indication: input.indication,
          sick_population: input.sickPopulation,
          mortality_count: input.mortalityCount,
          medicine_name: input.medicineName,
          item_id: input.itemId ?? null,
          quantity_used: input.itemId ? (input.quantityUsed ?? null) : null,
          dosage_and_duration: input.dosageAndDuration,
          application_method: input.applicationMethod,
          treatment_notes: input.treatmentNotes ?? null,
          treatment_date: treatmentDate,
          is_synced: true,
        },
        select: { id: true },
      });

      if (input.itemId && input.quantityUsed != null) {
        const stock = await applyStockMutation(tx, {
          itemId: input.itemId,
          locationId: cage.location_id,
          mutationType: StockMutationType.OUT_MEDICAL,
          quantity: input.quantityUsed,
          referenceId: record.id,
        });

        if (!stock.ok) {
          throw new StockError(stock.error);
        }

        return { lowStock: stock.lowStock, remainingStock: stock.newQuantity };
      }

      return { lowStock: false, remainingStock: null as number | null };
    });

    return {
      ok: true,
      lowStock: outcome.lowStock,
      remainingStock: outcome.remainingStock,
    };
  } catch (error) {
    if (error instanceof StockError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "Gagal menyimpan catatan pengobatan." };
  }
}
