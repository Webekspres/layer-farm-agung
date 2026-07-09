import { NextRequest } from "next/server";
import { requireApiPermissionWithTenant } from "@/lib/api/require-api-session";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/response";
import { feedConsumptionSchema } from "@/features/production/schemas/feed-consumption";
import { recordFeedConsumption } from "@/features/production/services/record-feed-consumption";

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

  const parsed = feedConsumptionSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(
      parsed.error.issues[0]?.message ?? "Data konsumsi pakan tidak valid.",
    );
  }

  const result = await recordFeedConsumption(
    auth.tenantId,
    auth.session.user.id,
    parsed.data,
  );

  if (!result.ok) {
    return apiError(result.error, 400);
  }

  const message = result.idempotent
    ? "Konsumsi pakan sudah tercatat sebelumnya."
    : result.lowStock
      ? "Konsumsi pakan berhasil dicatat. Peringatan: stok pakan sudah di bawah ambang batas."
      : "Konsumsi pakan berhasil dicatat.";

  return apiSuccess(
    {
      recorded: true,
      idempotent: result.idempotent,
      recordId: result.recordId,
      lowStock: result.lowStock,
      remainingStock: result.remainingStock,
    },
    message,
    result.idempotent ? 200 : 201,
  );
}
