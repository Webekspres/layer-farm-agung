"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { revokeAllUserSessions } from "@/features/auth/services/revoke-sessions";
import {
  getUsersTenantScope,
  requireManageUsersSession,
} from "@/features/users/lib/access";

export async function updateUserStatusAction(userId: string, isActive: boolean) {
  const session = await requireManageUsersSession();
  const { scopedTenantId } = getUsersTenantScope(session);

  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      ...(scopedTenantId ? { tenant_id: scopedTenantId } : {}),
    },
    select: { id: true },
  });

  if (!user) {
    return { error: "Pengguna tidak ditemukan." };
  }

  if (userId === session.user.id) {
    return { error: "Tidak dapat menonaktifkan akun sendiri." };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { is_active: isActive },
  });

  if (!isActive) {
    await revokeAllUserSessions(userId);
  }

  revalidatePath("/dashboard/users");
  return { success: true };
}
