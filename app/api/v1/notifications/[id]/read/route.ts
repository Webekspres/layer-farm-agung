import { NextRequest } from "next/server";
import { requireApiSession } from "@/lib/api/require-api-session";
import { apiError, apiSuccess } from "@/lib/api/response";
import { markAppNotificationRead } from "@/features/notifications/services/list-app-notifications";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiSession();

  if (auth.error) {
    return auth.error;
  }

  const { id } = await params;

  if (!id) {
    return apiError("ID notifikasi tidak valid.", 400);
  }

  const result = await markAppNotificationRead(auth.session.user.id, id);

  if (result.count === 0) {
    return apiError("Notifikasi tidak ditemukan.", 404);
  }

  return apiSuccess({ read: true }, "Notifikasi ditandai sudah dibaca.");
}