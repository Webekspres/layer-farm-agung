import { NextRequest } from "next/server";
import { requireApiPermissionWithTenant } from "@/lib/api/require-api-session";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/response";
import { dailyProductionSchema } from "@/features/production/schemas/daily-production";
import { recordDailyProduction } from "@/features/production/services/record-daily-production";

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

  const parsed = dailyProductionSchema.safeParse(body);

  if (!parsed.success) {
    return apiValidationError(
      parsed.error.issues[0]?.message ?? "Data produksi tidak valid.",
    );
  }

  const result = await recordDailyProduction(
    auth.tenantId,
    auth.session.user.id,
    parsed.data,
  );

  if (!result.ok) {
    return apiError(result.error, 400);
  }

  const message = result.idempotent
    ? "Produksi harian sudah tercatat sebelumnya."
    : "Produksi harian berhasil dicatat.";

  return apiSuccess(
    {
      recorded: true,
      idempotent: result.idempotent,
      recordId: result.recordId,
    },
    message,
    result.idempotent ? 200 : 201,
  );
}
