"use server";

import { revalidatePath } from "next/cache";
import {
  getVaccinationTenantScope,
  requireManageVaccinationSession,
} from "@/features/health/lib/access";
import { updateVaccineProgramSchema } from "@/features/health/schemas/vaccine-program";
import { updateVaccineProgram } from "@/features/health/services/update-vaccine-program";
import type { VaccineProgramFormState } from "@/features/health/actions/create-vaccine-program";

function parseStepsJson(raw: FormDataEntryValue | null) {
  if (typeof raw !== "string" || !raw.trim()) {
    return { ok: false as const, error: "Langkah program wajib diisi." };
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return { ok: false as const, error: "Format langkah tidak valid." };
    }
    return { ok: true as const, steps: parsed };
  } catch {
    return { ok: false as const, error: "Format langkah tidak valid." };
  }
}

export async function updateVaccineProgramAction(
  _prev: VaccineProgramFormState,
  formData: FormData,
): Promise<VaccineProgramFormState> {
  const session = await requireManageVaccinationSession();
  const { tenantId, needsTenantSelection } = getVaccinationTenantScope(session);

  if (needsTenantSelection || !tenantId) {
    return { error: "Pilih tenant aktif terlebih dahulu." };
  }

  const stepsParsed = parseStepsJson(formData.get("stepsJson"));
  if (!stepsParsed.ok) {
    return { error: stepsParsed.error };
  }

  const parsed = updateVaccineProgramSchema.safeParse({
    programId: formData.get("programId"),
    name: formData.get("name"),
    strainId: formData.get("strainId"),
    isActive: formData.get("isActive"),
    steps: stepsParsed.steps,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const result = await updateVaccineProgram(tenantId, parsed.data);
  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/dashboard/health/vaccine-programs");
  return { success: true };
}
