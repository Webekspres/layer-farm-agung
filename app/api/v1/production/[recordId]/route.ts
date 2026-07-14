import { NextRequest } from "next/server";
import { requireApiPermissionWithTenant } from "@/lib/api/require-api-session";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/response";
import { updateDailyProductionSchema } from "@/features/production/schemas/update-daily-production";
import { updateDailyProduction } from "@/features/production/services/update-daily-production";

type RouteContext = {
  params: Promise<{ recordId: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await requireApiPermissionWithTenant("manage_production");

  if (auth.error) {
    return auth.error;
  }

  const { recordId } = await context.params;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return apiValidationError("Body JSON tidak valid.");
  }

  const parsed = updateDailyProductionSchema.safeParse(body);

  if (!parsed.success) {
    return apiValidationError(
      parsed.error.issues[0]?.message ?? "Data produksi tidak valid.",
    );
  }

  const result = await updateDailyProduction(
    auth.tenantId,
    auth.session.user.id,
    recordId,
    parsed.data,
  );

  if (!result.ok) {
    return apiError(result.error, result.status);
  }

  return apiSuccess({ updated: true }, "Produksi harian berhasil diperbarui.");
}
