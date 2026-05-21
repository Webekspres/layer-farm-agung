"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireGlobalAdmin } from "@/features/auth/lib/require-permission";
import { requirePermission } from "@/features/auth/lib/require-permission";
import { subdomainSchema } from "@/features/subdomains/schemas/subdomain";

export type SubdomainFormState = {
  error?: string;
  success?: boolean;
};

export async function createSubdomainAction(
  _prev: SubdomainFormState,
  formData: FormData,
): Promise<SubdomainFormState> {
  const session = await requirePermission("manage_roles");
  requireGlobalAdmin(session);

  const parsed = subdomainSchema.safeParse({
    name: formData.get("name"),
    subdomainUrl: formData.get("subdomainUrl"),
    isActive: formData.get("isActive") === "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  try {
    await prisma.subdomain.create({
      data: {
        name: parsed.data.name,
        subdomain_url: parsed.data.subdomainUrl,
        is_active: parsed.data.isActive ?? true,
      },
    });
  } catch {
    return { error: "Gagal membuat cabang. URL mungkin sudah dipakai." };
  }

  revalidatePath("/dashboard/branches");
  return { success: true };
}
