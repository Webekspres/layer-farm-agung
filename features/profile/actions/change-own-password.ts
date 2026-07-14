"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { setUserPassword } from "@/features/auth/services/set-user-password";
import { getServerSession } from "@/features/auth/lib/session";
import { changeOwnPasswordSchema } from "@/features/users/schemas/user";

export type ChangeOwnPasswordState = {
  error?: string;
  success?: boolean;
};

export async function changeOwnPasswordAction(
  _prev: ChangeOwnPasswordState,
  formData: FormData,
): Promise<ChangeOwnPasswordState> {
  const session = await getServerSession();
  if (!session) {
    return { error: "Sesi tidak ditemukan." };
  }

  const parsed = changeOwnPasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Data tidak valid.",
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password_hash: true },
  });

  if (!user) {
    return { error: "Pengguna tidak ditemukan." };
  }

  const valid = await bcrypt.compare(
    parsed.data.currentPassword,
    user.password_hash,
  );

  if (!valid) {
    return { error: "Password saat ini salah." };
  }

  try {
    await setUserPassword(session.user.id, parsed.data.newPassword);
  } catch {
    return { error: "Gagal mengubah password." };
  }

  revalidatePath("/dashboard/profile");
  return { success: true };
}
