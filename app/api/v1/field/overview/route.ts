import { requireApiPermissionWithTenant } from "@/lib/api/require-api-session";
import { apiError, apiSuccess } from "@/lib/api/response";
import {
  DashboardScopeError,
  getFieldOverview,
} from "@/features/production/services/get-field-overview";

export async function GET(request: Request) {
  const auth = await requireApiPermissionWithTenant("manage_production");

  if (auth.error) {
    return auth.error;
  }

  const cageId = new URL(request.url).searchParams.get("cageId");

  try {
    const data = await getFieldOverview(auth.tenantId, auth.session.user.id, {
      cageId,
    });
    return apiSuccess(data, "Ringkasan lapangan berhasil dimuat.");
  } catch (error) {
    if (error instanceof DashboardScopeError) {
      return apiError(error.message, 403);
    }
    throw error;
  }
}
