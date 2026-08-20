import prisma from "@/lib/prisma";
import type { NotificationData, NotificationType } from "@/features/notifications/lib/notification-types";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

type ExpoPushMessage = {
  to: string;
  title: string;
  body: string;
  data: { type: NotificationType; [key: string]: unknown };
  sound: "default";
};

/**
 * Kirim push ke semua perangkat terdaftar milik pengguna via Expo Push API.
 * Token yang ditolak Expo (status DeviceNotRegistered) akan dihapus otomatis.
 */
export type ExpoPushResponse = {
  data?: Array<{ status?: string; id?: string; message?: string }>;
};

export function parseExpoPushResponse(
  devices: Array<{ id: string; token: string }>,
  response: ExpoPushResponse,
): { sent: number; failed: number; invalidTokenIds: string[] } {
  const invalidTokenIds: string[] = [];
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < (response.data?.length ?? 0); i++) {
    const entry = response.data?.[i];
    if (entry?.status === "ok") {
      sent++;
    } else {
      failed++;
      if (entry?.message?.includes("DeviceNotRegistered") && devices[i]) {
        invalidTokenIds.push(devices[i].id);
      }
    }
  }

  return { sent, failed, invalidTokenIds };
}

export async function sendPushNotification({
  userId,
  type,
  title,
  body,
  data = {},
}: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: NotificationData;
}) {
  const devices = await prisma.pushDeviceToken.findMany({
    where: { user_id: userId },
    select: { id: true, token: true },
  });

  if (devices.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const accessToken = process.env.EXPO_ACCESS_TOKEN;
  const messages: ExpoPushMessage[] = devices.map((device) => ({
    to: device.token,
    title,
    body,
    data: { type, ...data },
    sound: "default",
  }));

  let response: ExpoPushResponse;
  try {
    const res = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify(messages),
    });
    response = await res.json();
  } catch {
    return { sent: 0, failed: devices.length };
  }

  const parsed = parseExpoPushResponse(devices, response);

  if (parsed.invalidTokenIds.length > 0) {
    await prisma.pushDeviceToken.deleteMany({
      where: { id: { in: parsed.invalidTokenIds } },
    });
  }

  return { sent: parsed.sent, failed: parsed.failed };
}