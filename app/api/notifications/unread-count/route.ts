import { getServerSession } from "@/features/auth/lib/session";
import { getUnreadNotificationCount } from "@/features/notifications/services/list-app-notifications";

export async function GET() {
  const session = await getServerSession();

  if (!session) {
    return Response.json({ count: 0 }, { status: 401 });
  }

  const count = await getUnreadNotificationCount(session.user.id);

  return Response.json({ count });
}