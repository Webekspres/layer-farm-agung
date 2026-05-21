"use server";

import { revalidatePath } from "next/cache";
import { createUserWithCredential } from "@/features/auth/services/create-user";
import {
  getUsersTenantScope,
  requireManageUsersSession,
} from "@/features/users/lib/access";
import { createUserSchema } from "@/features/users/schemas/user";
import { resolveSubdomainForRoleAssignment } from "@/features/users/services/resolve-subdomain-for-role";

export type CreateUserState = {
  error?: string;
  success?: boolean;
};

export async function createUserAction(
  _prev: CreateUserState,
  formData: FormData,
): Promise<CreateUserState> {
  const session = await requireManageUsersSession();
  const { isGlobalAdmin, scopedSubdomainId } = getUsersTenantScope(session);

  const parsed = createUserSchema.safeParse({
    fullName: formData.get("fullName"),
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    roleId: formData.get("roleId"),
    subdomainId: formData.get("subdomainId"),
    isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Data tidak valid.",
    };
  }

  const data = parsed.data;

  const resolved = await resolveSubdomainForRoleAssignment({
    roleId: data.roleId,
    subdomainIdFromForm: data.subdomainId,
    isGlobalAdmin,
    scopedSubdomainId,
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
      subdomainId: resolved.subdomainId,
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
