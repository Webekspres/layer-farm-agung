"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
  requireGlobalAdmin,
  requirePermission,
} from "@/features/auth/lib/require-permission";
import { revokeAllBranchSessions } from "@/features/auth/services/revoke-sessions";
import { updateTenantSchema } from "@/features/tenants/schemas/tenant";

export type TenantFormState = {
  error?: string;
  success?: boolean;
};

export async function updateTenantAction(
  _prev: TenantFormState,
  formData: FormData,
): Promise<TenantFormState> {
  const session = await requirePermission("manage_roles");
  requireGlobalAdmin(session);

  const parsed = updateTenantSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    slug: formData.get("slug"),
    isActive: formData.get("isActive") === "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const existing = await prisma.tenant.findUnique({
    where: { id: parsed.data.id },
    select: { is_active: true },
  });

  if (!existing) {
    return { error: "Tenant tidak ditemukan." };
  }

  try {
    await prisma.tenant.update({
      where: { id: parsed.data.id },
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        is_active: parsed.data.isActive,
      },
    });

    if (existing.is_active && !parsed.data.isActive) {
      await revokeAllBranchSessions(parsed.data.id);
    }
  } catch {
    return { error: "Gagal memperbarui tenant." };
  }

  revalidatePath("/dashboard/tenants");
  return { success: true };
}
