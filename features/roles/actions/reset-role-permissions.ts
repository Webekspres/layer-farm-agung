"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/features/auth/lib/require-permission";
import { resetRolePermissionsToDefaults } from "@/features/roles/services/reset-role-permissions";

const schema = z.object({
  roleId: z.coerce.number().int().positive(),
});

export type ResetRolePermissionsState = {
  error?: string;
  success?: boolean;
};

export async function resetRolePermissionsAction(
  _prev: ResetRolePermissionsState,
  formData: FormData,
): Promise<ResetRolePermissionsState> {
  await requirePermission("manage_roles");

  const parsed = schema.safeParse({ roleId: formData.get("roleId") });
  if (!parsed.success) {
    return { error: "Data tidak valid." };
  }

  const result = await resetRolePermissionsToDefaults(parsed.data.roleId);
  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/dashboard/roles");
  return { success: true };
}
