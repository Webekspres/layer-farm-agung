import { NextRequest } from "next/server";
import { requireApiPermissionWithTenant } from "@/lib/api/require-api-session";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getCageForProduction } from "@/features/production/services/get-cage-for-production";

type RouteContext = {
  params: Promise<{ cageId: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const auth = await requireApiPermissionWithTenant("manage_production");

  if (auth.error) {
    return auth.error;
  }

  const { cageId } = await context.params;
  const cage = await getCageForProduction(auth.tenantId, cageId);

  if (!cage) {
    return apiError("Kandang tidak ditemukan di tenant ini.", 404);
  }

  return apiSuccess(cage, "Detail kandang berhasil dimuat.");
}
