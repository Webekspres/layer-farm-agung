import prisma from "@/lib/prisma";
import { CRITICAL_NOTIFICATION_TYPES, type AppNotificationView, type NotificationData, type NotificationType } from "@/features/notifications/lib/notification-types";

type ListAppNotificationsInput = {
  userId: string;
  unreadOnly?: boolean;
  limit?: number;
  cursor?: string;
};

export async function listAppNotifications(input: ListAppNotificationsInput) {
  const { userId, unreadOnly = false, limit = 50, cursor } = input;

  const rows = await prisma.appNotification.findMany({
    where: {
      user_id: userId,
      ...(unreadOnly ? { is_read: false } : {}),
      ...(cursor ? { id: { lt: cursor } } : {}),
    },
    orderBy: { created_at: "desc" },
    take: limit + 1,
  });

  const hasMore = rows.length > limit;
  const items = rows.slice(0, limit).map<AppNotificationView>((row) => ({
    id: row.id,
    type: row.type as NotificationType,
    title: row.title,
    body: row.body,
    data: row.data as NotificationData | null,
    isRead: row.is_read,
    createdAt: row.created_at.toISOString(),
    critical: CRITICAL_NOTIFICATION_TYPES.includes(row.type as NotificationType),
  }));

  return {
    items,
    nextCursor: hasMore ? (items[items.length - 1]?.id ?? null) : null,
    hasMore,
  };
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return prisma.appNotification.count({
    where: { user_id: userId, is_read: false },
  });
}

export async function markAppNotificationRead(userId: string, notificationId: string) {
  return prisma.appNotification.updateMany({
    where: { id: notificationId, user_id: userId },
    data: { is_read: true, read_at: new Date() },
  });
}

export async function markAllAppNotificationsRead(userId: string) {
  return prisma.appNotification.updateMany({
    where: { user_id: userId, is_read: false },
    data: { is_read: true, read_at: new Date() },
  });
}