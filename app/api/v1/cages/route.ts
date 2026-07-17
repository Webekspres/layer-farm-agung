import { requireApiPermissionWithTenant } from "@/lib/api/require-api-session";
import { apiSuccess } from "@/lib/api/response";
import { listFieldCages } from "@/features/production/services/list-field-cages";

export async function GET() {
  const auth = await requireApiPermissionWithTenant("manage_production");

  if (auth.error) {
    return auth.error;
  }

  const data = await listFieldCages(auth.tenantId, auth.session.user.id);

  return apiSuccess(data, "Daftar kandang berhasil dimuat.");
}
