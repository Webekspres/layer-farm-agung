import prisma from "@/lib/prisma";

/** Daftarkan perangkat mobile untuk push. Token lama yang sama akan di-update pemiliknya. */
export async function registerPushToken(input: {
  userId: string;
  token: string;
  platform?: string;
}) {
  const { userId, token, platform = "android" } = input;

  await prisma.pushDeviceToken.upsert({
    where: { token },
    create: { user_id: userId, token, platform },
    update: { user_id: userId, platform },
  });

  return { registered: true };
}

export async function unregisterPushToken(userId: string, token: string) {
  await prisma.pushDeviceToken.deleteMany({
    where: { token, user_id: userId },
  });

  return { unregistered: true };
}