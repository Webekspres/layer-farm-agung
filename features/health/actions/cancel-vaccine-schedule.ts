"use server";

import { revalidatePath } from "next/cache";
import {
  getVaccinationTenantScope,
  requireManageVaccinationSession,
} from "@/features/health/lib/access";
import { cancelVaccineScheduleSchema } from "@/features/health/schemas/vaccine-schedule";
import { cancelVaccineSchedule } from "@/features/health/services/cancel-vaccine-schedule";

export type CancelVaccineScheduleFormState = {
  error?: string;
  success?: boolean;
};

export async function cancelVaccineScheduleAction(
  _prev: CancelVaccineScheduleFormState,
  formData: FormData,
): Promise<CancelVaccineScheduleFormState> {
  const session = await requireManageVaccinationSession();
  const { tenantId, needsTenantSelection } = getVaccinationTenantScope(session);

  if (needsTenantSelection || !tenantId) {
    return { error: "Pilih tenant aktif terlebih dahulu." };
  }

  const parsed = cancelVaccineScheduleSchema.safeParse({
    scheduleId: formData.get("scheduleId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const result = await cancelVaccineSchedule(tenantId, parsed.data);

  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/dashboard/health/vaccines");
  return { success: true };
}
