import { isUserAssignedToCage } from "@/features/cages/services/is-user-assigned-to-cage";
import { applyStockMutation } from "@/features/inventory/services/apply-stock-mutation";
import { StockMutationType } from "@/features/inventory/lib/stock-mutation-types";
import { isPrismaUniqueViolation } from "@/features/production/lib/client-mutation-id";
import type { MedicalRecordInput } from "@/features/production/schemas/medical-record";
import { validateOperationalBusinessDate } from "@/lib/business-date";
import prisma from "@/lib/prisma";

export type RecordMedicalRecordResult =
  | {
      ok: true;
      idempotent: boolean;
      recordId: string;
      lowStock: boolean;
      remainingStock: number | null;
    }
  | { ok: false; error: string };

class StockError extends Error {}

export async function recordMedicalRecord(
  tenantId: string,
  userId: string,
  input: MedicalRecordInput,
): Promise<RecordMedicalRecordResult> {
  if (input.clientMutationId) {
    const existing = await prisma.medicalRecord.findUnique({
      where: { client_mutation_id: input.clientMutationId },
      select: { id: true },
    });

    if (existing) {
      return {
        ok: true,
        idempotent: true,
        recordId: existing.id,
        lowStock: false,
        remainingStock: null,
      };
    }
  }

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

  const assigned = await isUserAssignedToCage(userId, input.cageId);
  if (!assigned) {
    return { ok: false, error: "Anda tidak ditugaskan ke kandang ini." };
  }

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
  const isSynced = !input.fromSync;

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
          is_synced: isSynced,
          client_mutation_id: input.clientMutationId ?? null,
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

        return {
          recordId: record.id,
          lowStock: stock.lowStock,
          remainingStock: stock.newQuantity,
        };
      }

      return {
        recordId: record.id,
        lowStock: false,
        remainingStock: null as number | null,
      };
    });

    return {
      ok: true,
      idempotent: false,
      recordId: outcome.recordId,
      lowStock: outcome.lowStock,
      remainingStock: outcome.remainingStock,
    };
  } catch (error) {
    if (input.clientMutationId && isPrismaUniqueViolation(error)) {
      const existing = await prisma.medicalRecord.findUnique({
        where: { client_mutation_id: input.clientMutationId },
        select: { id: true },
      });

      if (existing) {
        return {
          ok: true,
          idempotent: true,
          recordId: existing.id,
          lowStock: false,
          remainingStock: null,
        };
      }
    }

    if (error instanceof StockError) {
      return { ok: false, error: error.message };
    }

    return { ok: false, error: "Gagal menyimpan catatan pengobatan." };
  }
}
