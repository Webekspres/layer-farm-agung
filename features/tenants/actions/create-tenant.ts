"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireGlobalAdmin } from "@/features/auth/lib/require-permission";
import { requirePermission } from "@/features/auth/lib/require-permission";
import { tenantSchema } from "@/features/tenants/schemas/tenant";

export type TenantFormState = {
  error?: string;
  success?: boolean;
};

export async function createTenantAction(
  _prev: TenantFormState,
  formData: FormData,
): Promise<TenantFormState> {
  const session = await requirePermission("manage_roles");
  requireGlobalAdmin(session);

  const parsed = tenantSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    isActive: formData.get("isActive") === "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  try {
    await prisma.tenant.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        is_active: parsed.data.isActive ?? true,
      },
    });
  } catch {
    return { error: "Gagal membuat tenant. Slug mungkin sudah dipakai." };
  }

  revalidatePath("/dashboard/tenants");
  return { success: true };
}
