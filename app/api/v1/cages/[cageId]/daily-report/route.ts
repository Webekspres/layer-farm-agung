import { NextRequest } from "next/server";
import { requireApiPermissionWithTenant } from "@/lib/api/require-api-session";
import { apiError, apiSuccess } from "@/lib/api/response";
import { parseProductionRecordDate } from "@/features/production/lib/parse-production-date";
import { getCageDailyReport } from "@/features/production/services/get-cage-daily-report";

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

  const report = await getCageDailyReport(
    auth.tenantId,
    auth.session.user.id,
    cageId,
    recordDate,
  );

  if (!report) {
    return apiError("Kandang tidak ditemukan atau Anda tidak ditugaskan.", 404);
  }

  return apiSuccess(report, "Laporan harian berhasil dimuat.");
}
