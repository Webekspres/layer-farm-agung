import { NextRequest } from "next/server";
import { requireApiPermissionWithTenant } from "@/lib/api/require-api-session";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/response";
import { completeVaccinationSchema } from "@/features/health/schemas/vaccine-schedule";
import { completeVaccination } from "@/features/health/services/complete-vaccination";

export async function POST(request: NextRequest) {
  const auth = await requireApiPermissionWithTenant("manage_production");

  if (auth.error) {
    return auth.error;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiValidationError("Body JSON tidak valid.");
  }

  const parsed = completeVaccinationSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(
      parsed.error.issues[0]?.message ?? "Data vaksinasi tidak valid.",
    );
  }

  const result = await completeVaccination(
    auth.tenantId,
    auth.session.user.id,
    parsed.data,
  );

  if (!result.ok) {
    return apiError(result.error, 400);
  }

  const message = result.idempotent
    ? "Vaksinasi sudah tercatat sebelumnya."
    : result.lowStock
      ? "Vaksinasi berhasil diselesaikan. Peringatan: stok vaksin sudah di bawah ambang batas."
      : "Vaksinasi berhasil diselesaikan.";

  return apiSuccess(
    {
      recorded: true,
      idempotent: result.idempotent,
      scheduleId: result.scheduleId,
      lowStock: result.lowStock,
      remainingStock: result.remainingStock,
    },
    message,
    result.idempotent ? 200 : 201,
  );
}
