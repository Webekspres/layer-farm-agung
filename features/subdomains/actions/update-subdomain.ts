"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
  requireGlobalAdmin,
  requirePermission,
} from "@/features/auth/lib/require-permission";
import { updateSubdomainSchema } from "@/features/subdomains/schemas/subdomain";

export type SubdomainFormState = {
  error?: string;
  success?: boolean;
};

export async function updateSubdomainAction(
  _prev: SubdomainFormState,
  formData: FormData,
): Promise<SubdomainFormState> {
  const session = await requirePermission("manage_roles");
  requireGlobalAdmin(session);

  const parsed = updateSubdomainSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    subdomainUrl: formData.get("subdomainUrl"),
    isActive: formData.get("isActive") === "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  try {
    await prisma.subdomain.update({
      where: { id: parsed.data.id },
      data: {
        name: parsed.data.name,
        subdomain_url: parsed.data.subdomainUrl,
        is_active: parsed.data.isActive,
      },
    });
  } catch {
    return { error: "Gagal memperbarui cabang." };
  }

  revalidatePath("/dashboard/branches");
  return { success: true };
}
