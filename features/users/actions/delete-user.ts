"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
  getUsersTenantScope,
  requireManageUsersSession,
} from "@/features/users/lib/access";
import { deleteUserSchema } from "@/features/users/schemas/user";

export type DeleteUserState = {
  error?: string;
  success?: boolean;
};

export async function deleteUserAction(
  userId: string,
): Promise<DeleteUserState> {
  const session = await requireManageUsersSession();
  const { scopedSubdomainId } = getUsersTenantScope(session);

  const parsed = deleteUserSchema.safeParse({ userId });
  if (!parsed.success) {
    return { error: "Data tidak valid." };
  }

  if (parsed.data.userId === session.user.id) {
    return { error: "Tidak dapat menghapus akun sendiri." };
  }

  const user = await prisma.user.findFirst({
    where: {
      id: parsed.data.userId,
      is_active: false,
      ...(scopedSubdomainId ? { subdomain_id: scopedSubdomainId } : {}),
    },
    select: {
      id: true,
      _count: {
        select: {
          daily_productions: true,
          feed_consumptions: true,
        },
      },
    },
  });

  if (!user) {
    return {
      error:
        "Pengguna tidak ditemukan, masih aktif, atau di luar cabang Anda.",
    };
  }

  if (
    user._count.daily_productions > 0 ||
    user._count.feed_consumptions > 0
  ) {
    return {
      error:
        "Pengguna memiliki riwayat operasional dan tidak dapat dihapus permanen.",
    };
  }

  try {
    await prisma.user.delete({ where: { id: user.id } });
  } catch {
    return { error: "Gagal menghapus pengguna." };
  }

  revalidatePath("/dashboard/users");
  return { success: true };
}
