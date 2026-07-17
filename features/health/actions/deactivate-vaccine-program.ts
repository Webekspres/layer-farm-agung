"use server";

import { revalidatePath } from "next/cache";
import {
  getVaccinationTenantScope,
  requireManageVaccinationSession,
} from "@/features/health/lib/access";
import { deactivateVaccineProgramSchema } from "@/features/health/schemas/vaccine-program";
import { deactivateVaccineProgram } from "@/features/health/services/deactivate-vaccine-program";

export type DeactivateVaccineProgramFormState = {
  error?: string;
  success?: boolean;
};

export async function deactivateVaccineProgramAction(
  _prev: DeactivateVaccineProgramFormState,
  formData: FormData,
): Promise<DeactivateVaccineProgramFormState> {
  const session = await requireManageVaccinationSession();
  const { tenantId, needsTenantSelection } = getVaccinationTenantScope(session);

  if (needsTenantSelection || !tenantId) {
    return { error: "Pilih tenant aktif terlebih dahulu." };
  }

  const parsed = deactivateVaccineProgramSchema.safeParse({
    programId: formData.get("programId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const result = await deactivateVaccineProgram(tenantId, parsed.data.programId);
  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/dashboard/health/vaccine-programs");
  return { success: true };
}
