import { NextRequest } from "next/server";
import { requireApiPermissionWithTenant } from "@/lib/api/require-api-session";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/response";
import { VACCINE_SCHEDULE_STATUSES } from "@/features/health/types";
import { listVaccineSchedulesForCage } from "@/features/health/services/list-pending-vaccine-schedules-for-cage";

type RouteContext = {
  params: Promise<{ cageId: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await requireApiPermissionWithTenant("manage_production");

  if (auth.error) {
    return auth.error;
  }

  const { cageId } = await context.params;
  const statusParam = request.nextUrl.searchParams.get("status");

  if (
    statusParam &&
    !(VACCINE_SCHEDULE_STATUSES as readonly string[]).includes(statusParam)
  ) {
    return apiValidationError(
      "Parameter 'status' harus salah satu dari: Pending, Completed, Cancelled.",
    );
  }

  const schedules = await listVaccineSchedulesForCage(
    auth.tenantId,
    auth.session.user.id,
    cageId,
    (statusParam as (typeof VACCINE_SCHEDULE_STATUSES)[number] | null) ??
      "Pending",
  );

  if (!schedules) {
    return apiError("Kandang tidak ditemukan atau Anda tidak ditugaskan.", 404);
  }

  return apiSuccess(schedules, "Daftar jadwal vaksinasi berhasil dimuat.");
}
