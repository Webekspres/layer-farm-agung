"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
  getUsersTenantScope,
  requireManageUsersSession,
} from "@/features/users/lib/access";
import { updateUserSchema } from "@/features/users/schemas/user";
import { updateUserRecord } from "@/features/users/services/update-user";

export type UpdateUserState = {
  error?: string;
  success?: boolean;
};

export async function updateUserAction(
  _prev: UpdateUserState,
  formData: FormData,
): Promise<UpdateUserState> {
  const session = await requireManageUsersSession();
  const { isGlobalAdmin, scopedSubdomainId } = getUsersTenantScope(session);

  const parsed = updateUserSchema.safeParse({
    userId: formData.get("userId"),
    fullName: formData.get("fullName"),
    username: formData.get("username"),
    email: formData.get("email"),
    roleId: formData.get("roleId"),
    subdomainId: formData.get("subdomainId"),
    isActive: formData.get("isActive") === "true",
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Data tidak valid.",
    };
  }

  const data = parsed.data;

  if (data.userId === session.user.id && !data.isActive) {
    return { error: "Tidak dapat menonaktifkan akun sendiri." };
  }

  const existing = await prisma.user.findFirst({
    where: {
      id: data.userId,
      ...(scopedSubdomainId ? { subdomain_id: scopedSubdomainId } : {}),
    },
    select: { id: true },
  });

  if (!existing) {
    return { error: "Pengguna tidak ditemukan." };
  }

  let subdomainId: string | null = null;
  if (isGlobalAdmin) {
    if (data.subdomainId && data.subdomainId !== "global") {
      subdomainId = data.subdomainId;
    }
  } else {
    subdomainId = scopedSubdomainId;
  }

  try {
    await updateUserRecord(data.userId, {
      fullName: data.fullName,
      username: data.username,
      email: data.email || null,
      roleId: data.roleId,
      subdomainId,
      isActive: data.isActive,
    });
  } catch {
    return {
      error:
        "Gagal memperbarui pengguna. Username atau email mungkin sudah dipakai.",
    };
  }

  revalidatePath("/dashboard/users");
  return { success: true };
}
