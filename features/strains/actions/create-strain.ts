"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireManageGlobalCatalogSession } from "@/features/master-data/lib/access";
import { strainSchema } from "@/features/strains/schemas/strain";

export type StrainFormState = {
  error?: string;
  success?: boolean;
};

export async function createStrainAction(
  _prev: StrainFormState,
  formData: FormData,
): Promise<StrainFormState> {
  await requireManageGlobalCatalogSession();

  const parsed = strainSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  try {
    await prisma.strain.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description ?? null,
      },
    });
  } catch {
    return { error: "Gagal membuat strain. Nama mungkin sudah dipakai." };
  }

  revalidatePath("/dashboard/strains");
  revalidatePath("/dashboard/cages");
  return { success: true };
}
