"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireManageGlobalCatalogSession } from "@/features/master-data/lib/access";
import { deleteProductionTargetSchema } from "@/features/strains/schemas/strain";

export type TargetFormState = {
  error?: string;
  success?: boolean;
};

export async function deleteProductionTargetAction(
  _prev: TargetFormState,
  formData: FormData,
): Promise<TargetFormState> {
  await requireManageGlobalCatalogSession();

  const parsed = deleteProductionTargetSchema.safeParse({
    id: formData.get("id"),
    strainId: formData.get("strainId"),
  });

  if (!parsed.success) {
    return { error: "Data tidak valid." };
  }

  try {
    await prisma.productionTarget.delete({
      where: { id: parsed.data.id },
    });
  } catch {
    return { error: "Gagal menghapus target performa." };
  }

  revalidatePath("/dashboard/strains");
  return { success: true };
}
