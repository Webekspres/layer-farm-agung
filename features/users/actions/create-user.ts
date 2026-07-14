"use server";

import { revalidatePath } from "next/cache";
import { createUserWithCredential } from "@/features/auth/services/create-user";
import {
  getUsersTenantScope,
  requireManageUsersSession,
} from "@/features/users/lib/access";
import { createUserSchema } from "@/features/users/schemas/user";
import { resolveTenantForRoleAssignment } from "@/features/users/services/resolve-tenant-for-role";

export type CreateUserState = {
  error?: string;
  success?: boolean;
};

export async function createUserAction(
  _prev: CreateUserState,
  formData: FormData,
): Promise<CreateUserState> {
  const session = await requireManageUsersSession();
  const { isGlobalAdmin, scopedTenantId } = getUsersTenantScope(session);

  const parsed = createUserSchema.safeParse({
    fullName: formData.get("fullName"),
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    roleId: formData.get("roleId"),
    tenantId: formData.get("tenantId"),
    isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Data tidak valid.",
    };
  }

  const data = parsed.data;

  const resolved = await resolveTenantForRoleAssignment({
    roleId: data.roleId,
    tenantIdFromForm: data.tenantId,
    isGlobalAdmin,
    scopedTenantId,
  });

  if (resolved.error) {
    return { error: resolved.error };
  }

  try {
    await createUserWithCredential({
      fullName: data.fullName,
      username: data.username,
      email: data.email || null,
      password: data.password,
      roleId: data.roleId,
      tenantId: resolved.tenantId,
      isActive: data.isActive ?? true,
    });
  } catch {
    return {
      error:
        "Gagal membuat pengguna. Username atau email mungkin sudah dipakai.",
    };
  }

  revalidatePath("/dashboard/users");
  return { success: true };
}
