"use server";

import { revalidatePath } from "next/cache";
import { requireManageGlobalCatalogSession } from "@/features/master-data/lib/access";
import { updateProductionTargetSchema } from "@/features/strains/schemas/strain";
import prisma from "@/lib/prisma";

export type TargetFormState = {
  error?: string;
  success?: boolean;
};

export async function updateProductionTargetAction(
  _prev: TargetFormState,
  formData: FormData,
): Promise<TargetFormState> {
  await requireManageGlobalCatalogSession();

  const parsed = updateProductionTargetSchema.safeParse({
    id: formData.get("id"),
    strainId: formData.get("strainId"),
    ageInWeeks: formData.get("ageInWeeks"),
    targetHdp: formData.get("targetHdp"),
    targetFcr: formData.get("targetFcr"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const { id, strainId, ageInWeeks, targetHdp, targetFcr } = parsed.data;

  const duplicate = await prisma.productionTarget.findFirst({
    where: {
      strain_id: strainId,
      age_in_weeks: ageInWeeks,
      NOT: { id },
    },
    select: { id: true },
  });

  if (duplicate) {
    return { error: `Target performa untuk umur ${ageInWeeks} minggu sudah ada.` };
  }

  try {
    await prisma.productionTarget.update({
      where: { id },
      data: {
        strain_id: strainId,
        age_in_weeks: ageInWeeks,
        target_hdp: targetHdp,
        target_fcr: targetFcr,
      },
    });
  } catch {
    return { error: "Gagal memperbarui target performa." };
  }

  revalidatePath("/dashboard/strains");
  return { success: true };
}
