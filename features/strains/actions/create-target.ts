"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireManageGlobalCatalogSession } from "@/features/master-data/lib/access";
import { productionTargetSchema } from "@/features/strains/schemas/strain";

export type TargetFormState = {
  error?: string;
  success?: boolean;
};

export async function createProductionTargetAction(
  _prev: TargetFormState,
  formData: FormData,
): Promise<TargetFormState> {
  await requireManageGlobalCatalogSession();

  const parsed = productionTargetSchema.safeParse({
    strainId: formData.get("strainId"),
    ageInWeeks: formData.get("ageInWeeks"),
    targetHdp: formData.get("targetHdp"),
    targetFcr: formData.get("targetFcr"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const { strainId, ageInWeeks, targetHdp, targetFcr } = parsed.data;

  // Check if target for this age already exists
  const existing = await prisma.productionTarget.findFirst({
    where: { strain_id: strainId, age_in_weeks: ageInWeeks },
  });

  if (existing) {
    return { error: `Target performa untuk umur ${ageInWeeks} minggu sudah ada.` };
  }

  try {
    await prisma.productionTarget.create({
      data: {
        strain_id: strainId,
        age_in_weeks: ageInWeeks,
        target_hdp: targetHdp,
        target_fcr: targetFcr,
      },
    });
  } catch {
    return { error: "Gagal menambahkan target performa." };
  }

  revalidatePath("/dashboard/strains");
  return { success: true };
}
