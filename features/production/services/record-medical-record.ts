import { isUserAssignedToCage } from "@/features/cages/services/is-user-assigned-to-cage";
import type { MedicalRecordInput } from "@/features/production/schemas/medical-record";
import prisma from "@/lib/prisma";

export type RecordMedicalRecordResult =
  | { ok: true }
  | { ok: false; error: string };

function startOfUtcDate(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

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
    select: { id: true, status: true },
  });

  if (!cage) {
    return { ok: false, error: "Kandang tidak ditemukan di tenant ini." };
  }

  // Verify user is assigned to this cage
  const assigned = await isUserAssignedToCage(userId, input.cageId);
  if (!assigned) {
    return { ok: false, error: "Anda tidak ditugaskan ke kandang ini." };
  }

  const treatmentDate = startOfUtcDate(input.treatmentDate);

  try {
    await prisma.medicalRecord.create({
      data: {
        cage_id: input.cageId,
        user_id: userId,
        indication: input.indication,
        sick_population: input.sickPopulation,
        mortality_count: input.mortalityCount,
        medicine_name: input.medicineName,
        dosage_and_duration: input.dosageAndDuration,
        application_method: input.applicationMethod,
        treatment_notes: input.treatmentNotes ?? null,
        treatment_date: treatmentDate,
        is_synced: true,
      },
    });
  } catch {
    return { ok: false, error: "Gagal menyimpan catatan pengobatan." };
  }

  return { ok: true };
}
