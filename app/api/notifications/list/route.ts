import { NextRequest } from "next/server";
import { getServerSession } from "@/features/auth/lib/session";
import { getUnreadNotificationCount, listAppNotifications } from "@/features/notifications/services/list-app-notifications";

export async function GET(request: NextRequest) {
  const session = await getServerSession();

  if (!session) {
    return Response.json({ items: [], unreadCount: 0 }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const limit = Math.min(
    Number(searchParams.get("limit") ?? 20) || 20,
    50,
  );
  const cursor = searchParams.get("cursor") ?? undefined;

  const [page, unreadCount] = await Promise.all([
    listAppNotifications({
      userId: session.user.id,
      limit,
      cursor,
    }),
    getUnreadNotificationCount(session.user.id),
  ]);

  return Response.json({
    items: page.items,
    nextCursor: page.nextCursor,
    hasMore: page.hasMore,
    unreadCount,
  });
}