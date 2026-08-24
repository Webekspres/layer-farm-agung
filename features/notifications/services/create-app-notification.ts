import type { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import type { NotificationData, NotificationType } from "@/features/notifications/lib/notification-types";
import { sendPushNotification } from "@/features/notifications/services/send-push-notification";

type CreateAppNotificationInput = {
  tenantId: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: NotificationData;
  /** Kunci idempotensi — notifikasi tidak dibuat ulang bila sudah ada (job). */
  dedupeKey?: string;
  /** Kirim push ke perangkat pengguna setelah tersimpan (default true). */
  push?: boolean;
};

/**
 * Simpan notifikasi in-app per pengguna. Bila `dedupeKey` diberikan,
 * baris yang sama (user + key) tidak dibuat dua kali dan push dilewati.
 */
export async function createAppNotification(input: CreateAppNotificationInput) {
  const { tenantId, userId, type, title, body, data = {}, dedupeKey, push = true } = input;

  const result = await prisma.appNotification.upsert({
    where: dedupeKey
      ? {
          user_id_dedupe_key: {
            user_id: userId,
            dedupe_key: dedupeKey,
          },
        }
      : { id: "" },
    create: {
      tenant_id: tenantId,
      user_id: userId,
      type,
      title,
      body,
      data: data as Prisma.InputJsonValue,
      dedupe_key: dedupeKey ?? null,
    },
    update: {},
    select: { id: true },
  });

  if (push) {
    await sendPushNotification({ userId, type, title, body, data });
  }

  return { id: result.id };
}

/** Kirim notifikasi yang sama ke banyak penerima sekaligus. */
export async function createAppNotifications(input: Omit<CreateAppNotificationInput, "userId"> & { userIds: string[] }) {
  const { userIds, ...rest } = input;
  const results: Array<{ id: string; userId: string }> = [];

  for (const userId of userIds) {
    const result = await createAppNotification({ ...rest, userId });
    results.push({ ...result, userId });
  }

  return results;
}