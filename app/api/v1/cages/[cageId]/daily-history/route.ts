import { NextRequest } from "next/server";
import { requireApiPermissionWithTenant } from "@/lib/api/require-api-session";
import { apiError, apiSuccess } from "@/lib/api/response";
import { parseProductionRecordDate } from "@/features/production/lib/parse-production-date";
import { listCageDailyHistory } from "@/features/production/services/list-cage-daily-history";

type RouteContext = {
  params: Promise<{ cageId: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await requireApiPermissionWithTenant("manage_production");

  if (auth.error) {
    return auth.error;
  }

  const { cageId } = await context.params;
  const dateParam = request.nextUrl.searchParams.get("date");
  const recordDate = parseProductionRecordDate(dateParam);

  const history = await listCageDailyHistory(
    auth.tenantId,
    auth.session.user.id,
    cageId,
    recordDate,
  );

  if (!history) {
    return apiError("Kandang tidak ditemukan atau Anda tidak ditugaskan.", 404);
  }

  return apiSuccess(history, "Riwayat harian kandang berhasil dimuat.");
}
