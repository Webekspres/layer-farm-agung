"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "@/features/auth/lib/session";
import prisma from "@/lib/prisma";
import { CRITICAL_NOTIFICATION_TYPES } from "@/features/notifications/lib/notification-types";
import { markAllAppNotificationsRead, markAppNotificationRead } from "@/features/notifications/services/list-app-notifications";

export async function markNotificationReadAction(notificationId: string): Promise<void> {
  const session = await getServerSession();

  if (!session) {
    return;
  }

  await markAppNotificationRead(session.user.id, notificationId);
  revalidatePath("/dashboard", "layout");
}

export async function markAllNotificationsReadAction(): Promise<void> {
  const session = await getServerSession();

  if (!session) {
    return;
  }

  await markAllAppNotificationsRead(session.user.id);
  revalidatePath("/dashboard", "layout");
}

export async function markCriticalNotificationsReadAction(): Promise<void> {
  const session = await getServerSession();

  if (!session) {
    return;
  }

  await prisma.appNotification.updateMany({
    where: {
      user_id: session.user.id,
      is_read: false,
      type: { in: CRITICAL_NOTIFICATION_TYPES },
    },
    data: { is_read: true, read_at: new Date() },
  });
  revalidatePath("/dashboard", "layout");
}