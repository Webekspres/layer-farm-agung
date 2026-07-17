"use server";

import { revalidatePath } from "next/cache";
import {
  getVaccinationTenantScope,
  requireManageVaccinationSession,
} from "@/features/health/lib/access";
import { completeVaccinationSchema } from "@/features/health/schemas/vaccine-schedule";
import { completeVaccination } from "@/features/health/services/complete-vaccination";

export type CompleteVaccinationFormState = {
  error?: string;
  success?: boolean;
};

export async function completeVaccinationAction(
  _prev: CompleteVaccinationFormState,
  formData: FormData,
): Promise<CompleteVaccinationFormState> {
  const session = await requireManageVaccinationSession();
  const { tenantId, needsTenantSelection } = getVaccinationTenantScope(session);

  if (needsTenantSelection || !tenantId) {
    return { error: "Pilih tenant aktif terlebih dahulu." };
  }

  const parsed = completeVaccinationSchema.safeParse({
    scheduleId: formData.get("scheduleId"),
    quantityUsed: formData.get("quantityUsed"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  // Admin dashboard override — a tenant admin may not be assigned to the
  // cage, so the "assigned staff" check is skipped here (mobile API keeps it).
  const result = await completeVaccination(
    tenantId,
    session.user.id,
    parsed.data,
    { skipAssignmentCheck: true },
  );

  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/dashboard/health/vaccines");
  return { success: true };
}
