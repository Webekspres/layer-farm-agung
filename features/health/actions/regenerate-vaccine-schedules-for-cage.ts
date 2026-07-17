"use server";

import { revalidatePath } from "next/cache";
import {
  getVaccinationTenantScope,
  requireManageVaccinationSession,
} from "@/features/health/lib/access";
import { generateVaccineSchedulesForCycle } from "@/features/health/services/generate-vaccine-schedules-for-cycle";
import prisma from "@/lib/prisma";
import { z } from "zod";

const regenerateSchema = z.object({
  cageId: z.string().uuid("Kandang tidak valid."),
});

export type RegenerateVaccineSchedulesFormState = {
  error?: string;
  success?: boolean;
  message?: string;
};

export async function regenerateVaccineSchedulesForCageAction(
  _prev: RegenerateVaccineSchedulesFormState,
  formData: FormData,
): Promise<RegenerateVaccineSchedulesFormState> {
  const session = await requireManageVaccinationSession();
  const { tenantId, needsTenantSelection } = getVaccinationTenantScope(session);

  if (needsTenantSelection || !tenantId) {
    return { error: "Pilih tenant aktif terlebih dahulu." };
  }

  const parsed = regenerateSchema.safeParse({
    cageId: formData.get("cageId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const cage = await prisma.cage.findFirst({
    where: {
      id: parsed.data.cageId,
      location: { tenant_id: tenantId },
    },
    select: {
      id: true,
      cycle_settings: {
        where: { status: "Active" },
        orderBy: { start_date: "desc" },
        take: 1,
        select: { start_date: true },
      },
    },
  });

  if (!cage) {
    return { error: "Kandang tidak ditemukan." };
  }

  const activeCycle = cage.cycle_settings[0];
  if (!activeCycle) {
    return { error: "Kandang tidak memiliki siklus aktif." };
  }

  const result = await generateVaccineSchedulesForCycle(
    tenantId,
    cage.id,
    activeCycle.start_date,
  );

  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath(`/dashboard/cages/${cage.id}`);
  revalidatePath("/dashboard/health/vaccines");

  if (result.info) {
    return {
      success: true,
      message: result.info,
    };
  }

  return {
    success: true,
    message: `Jadwal dibuat: ${result.created}, dilewati (sudah ada): ${result.skipped}${
      result.programName ? ` · Program: ${result.programName}` : ""
    }.`,
  };
}
