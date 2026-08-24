import { NextRequest } from "next/server";
import { requireApiSession } from "@/lib/api/require-api-session";
import { apiSuccess } from "@/lib/api/response";
import { listAppNotifications, markAllAppNotificationsRead } from "@/features/notifications/services/list-app-notifications";
import { getUnreadNotificationCount } from "@/features/notifications/services/list-app-notifications";

export async function GET(request: NextRequest) {
  const auth = await requireApiSession();

  if (auth.error) {
    return auth.error;
  }

  const searchParams = request.nextUrl.searchParams;
  const unreadOnly = searchParams.get("unreadOnly") === "1" || searchParams.get("unreadOnly") === "true";
  const limit = Math.min(
    Number(searchParams.get("limit") ?? 50) || 50,
    100,
  );
  const cursor = searchParams.get("cursor") ?? undefined;

  const [page, unreadCount] = await Promise.all([
    listAppNotifications({
      userId: auth.session.user.id,
      unreadOnly,
      limit,
      cursor,
    }),
    getUnreadNotificationCount(auth.session.user.id),
  ]);

  return apiSuccess(
    {
      items: page.items,
      nextCursor: page.nextCursor,
      hasMore: page.hasMore,
      unreadCount,
    },
    "Daftar notifikasi berhasil dimuat.",
  );
}

export async function POST() {
  const auth = await requireApiSession();

  if (auth.error) {
    return auth.error;
  }

  const result = await markAllAppNotificationsRead(auth.session.user.id);

  return apiSuccess(
    { updated: result.count },
    "Semua notifikasi ditandai sudah dibaca.",
  );
}