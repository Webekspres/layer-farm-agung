"use server";

import { revalidatePath } from "next/cache";
import {
  getProductionTenantScope,
  requireManageProductionSession,
} from "@/features/production/lib/access";
import { medicalRecordSchema } from "@/features/production/schemas/medical-record";
import { recordMedicalRecord } from "@/features/production/services/record-medical-record";

export type RecordMedicalRecordState = {
  error?: string;
  success?: boolean;
};

export async function recordMedicalRecordAction(
  _prev: RecordMedicalRecordState,
  formData: FormData,
): Promise<RecordMedicalRecordState> {
  const session = await requireManageProductionSession();
  const { tenantId, needsTenantSelection } = getProductionTenantScope(session);

  if (needsTenantSelection || !tenantId) {
    return { error: "Pilih tenant aktif terlebih dahulu." };
  }

  const parsed = medicalRecordSchema.safeParse({
    cageId: formData.get("cageId"),
    indication: formData.get("indication"),
    sickPopulation: formData.get("sickPopulation"),
    mortalityCount: formData.get("mortalityCount"),
    medicineName: formData.get("medicineName"),
    dosageAndDuration: formData.get("dosageAndDuration"),
    applicationMethod: formData.get("applicationMethod"),
    treatmentNotes: formData.get("treatmentNotes"),
    treatmentDate: formData.get("treatmentDate"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const result = await recordMedicalRecord(
    tenantId,
    session.user.id,
    parsed.data,
  );

  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/dashboard/production");
  return { success: true };
}
