"use server";

import { revalidatePath } from "next/cache";
import {
  getVaccinationTenantScope,
  requireManageVaccinationSession,
} from "@/features/health/lib/access";
import { createVaccineScheduleSchema } from "@/features/health/schemas/vaccine-schedule";
import { createVaccineSchedule } from "@/features/health/services/create-vaccine-schedule";

export type VaccineScheduleFormState = {
  error?: string;
  success?: boolean;
};

export async function createVaccineScheduleAction(
  _prev: VaccineScheduleFormState,
  formData: FormData,
): Promise<VaccineScheduleFormState> {
  const session = await requireManageVaccinationSession();
  const { tenantId, needsTenantSelection } = getVaccinationTenantScope(session);

  if (needsTenantSelection || !tenantId) {
    return { error: "Pilih tenant aktif terlebih dahulu." };
  }

  const parsed = createVaccineScheduleSchema.safeParse({
    cageId: formData.get("cageId"),
    itemId: formData.get("itemId"),
    scheduledDate: formData.get("scheduledDate"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const result = await createVaccineSchedule(tenantId, parsed.data);

  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/dashboard/health/vaccines");
  return { success: true };
}
