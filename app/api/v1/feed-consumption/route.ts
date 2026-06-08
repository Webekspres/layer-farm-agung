import { NextRequest } from "next/server";
import { requireApiPermissionWithTenant } from "@/lib/api/require-api-session";
import { apiError } from "@/lib/api/response";

/** Placeholder until `features/inventory` feed service is implemented. */
export async function POST(_request: NextRequest) {
  const auth = await requireApiPermissionWithTenant("manage_inventory");

  if (auth.error) {
    return auth.error;
  }

  return apiError(
    "Endpoint konsumsi pakan belum tersedia. Layanan domain sedang dalam pengembangan.",
    501,
  );
}
