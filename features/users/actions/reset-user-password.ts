"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { setUserPassword } from "@/features/auth/services/set-user-password";
import {
  getUsersTenantScope,
  requireManageUsersSession,
} from "@/features/users/lib/access";
import { resetUserPasswordSchema } from "@/features/users/schemas/user";

export type ResetPasswordState = {
  error?: string;
  success?: boolean;
};

export async function resetUserPasswordAction(
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const session = await requireManageUsersSession();
  const { scopedSubdomainId } = getUsersTenantScope(session);

  const parsed = resetUserPasswordSchema.safeParse({
    userId: formData.get("userId"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Data tidak valid.",
    };
  }

  const user = await prisma.user.findFirst({
    where: {
      id: parsed.data.userId,
      ...(scopedSubdomainId ? { subdomain_id: scopedSubdomainId } : {}),
    },
    select: { id: true },
  });

  if (!user) {
    return { error: "Pengguna tidak ditemukan." };
  }

  try {
    await setUserPassword(parsed.data.userId, parsed.data.password);
  } catch {
    return { error: "Gagal mengatur ulang password." };
  }

  revalidatePath("/dashboard/users");
  return { success: true };
}
