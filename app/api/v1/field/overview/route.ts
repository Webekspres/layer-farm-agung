import { requireApiPermissionWithTenant } from "@/lib/api/require-api-session";
import { apiSuccess } from "@/lib/api/response";
import { getFieldOverview } from "@/features/production/services/get-field-overview";

export async function GET() {
  const auth = await requireApiPermissionWithTenant("manage_production");

  if (auth.error) {
    return auth.error;
  }

  const data = await getFieldOverview(auth.tenantId, auth.session.user.id);

  return apiSuccess(data, "Ringkasan lapangan berhasil dimuat.");
}
