import { NextRequest } from "next/server";
import { requireApiPermissionWithTenant } from "@/lib/api/require-api-session";
import { apiError, apiSuccess } from "@/lib/api/response";
import { isUserAssignedToCage } from "@/features/cages/services/is-user-assigned-to-cage";
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

  const assigned = await isUserAssignedToCage(auth.session.user.id, cageId);

  if (!assigned) {
    return apiError("Anda tidak ditugaskan ke kandang ini.", 403);
  }

  const cage = await getCageForProduction(auth.tenantId, cageId);

  if (!cage) {
    return apiError("Kandang tidak ditemukan di tenant ini.", 404);
  }

  if (!cage.hasActiveCycle) {
    return apiError(
      "Kandang sedang rehat — tidak ada periode produksi aktif.",
      403,
    );
  }

  return apiSuccess(cage, "Detail kandang berhasil dimuat.");
}
