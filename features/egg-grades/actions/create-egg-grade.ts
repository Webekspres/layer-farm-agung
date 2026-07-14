"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireManageGlobalCatalogSession } from "@/features/master-data/lib/access";
import { eggGradeSchema } from "@/features/egg-grades/schemas/egg-grade";

export type EggGradeFormState = {
  error?: string;
  success?: boolean;
};

export async function createEggGradeAction(
  _prev: EggGradeFormState,
  formData: FormData,
): Promise<EggGradeFormState> {
  await requireManageGlobalCatalogSession();

  const parsed = eggGradeSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  try {
    await prisma.eggGrade.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description ?? null,
      },
    });
  } catch {
    return { error: "Gagal membuat grade. Nama mungkin sudah dipakai." };
  }

  revalidatePath("/dashboard/egg-grades");
  return { success: true };
}
