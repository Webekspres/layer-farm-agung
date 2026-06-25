import { NextRequest } from "next/server";
import { requireApiPermissionWithTenant } from "@/lib/api/require-api-session";
import { apiError, apiSuccess } from "@/lib/api/response";
import { listFeedItems } from "@/features/production/services/list-feed-items";

export async function GET(_request: NextRequest) {
  const auth = await requireApiPermissionWithTenant("manage_production");

  if (auth.error) {
    return auth.error;
  }

  try {
    const items = await listFeedItems(auth.tenantId);
    return apiSuccess(items, "Daftar pakan berhasil diambil.");
  } catch (error) {
    return apiError("Gagal mengambil daftar pakan.", 500);
  }
}
