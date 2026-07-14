"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireManageGlobalCatalogSession } from "@/features/master-data/lib/access";
import { updateStrainSchema } from "@/features/strains/schemas/strain";

export type StrainFormState = {
  error?: string;
  success?: boolean;
};

export async function updateStrainAction(
  _prev: StrainFormState,
  formData: FormData,
): Promise<StrainFormState> {
  await requireManageGlobalCatalogSession();

  const parsed = updateStrainSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  try {
    await prisma.strain.update({
      where: { id: parsed.data.id },
      data: {
        name: parsed.data.name,
        description: parsed.data.description ?? null,
      },
    });
  } catch {
    return { error: "Gagal memperbarui strain." };
  }

  revalidatePath("/dashboard/strains");
  revalidatePath("/dashboard/cages");
  return { success: true };
}
