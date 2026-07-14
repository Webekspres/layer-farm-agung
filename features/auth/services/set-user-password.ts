import prisma from "@/lib/prisma";
import { hashPasswordsForUser } from "@/features/auth/lib/password";

export async function setUserPassword(userId: string, password: string) {
  const { credentialHash, passwordHash } = await hashPasswordsForUser(password);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { password_hash: passwordHash },
    });

    await tx.account.updateMany({
      where: { user_id: userId, provider_id: "credential" },
      data: { password: credentialHash },
    });
  });
}
