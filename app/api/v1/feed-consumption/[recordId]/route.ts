import { NextRequest } from "next/server";
import { requireApiPermissionWithTenant } from "@/lib/api/require-api-session";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/response";
import { updateFeedConsumptionSchema } from "@/features/production/schemas/update-feed-consumption";
import { updateFeedConsumption } from "@/features/production/services/update-feed-consumption";

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

  const parsed = updateFeedConsumptionSchema.safeParse(body);

  if (!parsed.success) {
    return apiValidationError(
      parsed.error.issues[0]?.message ?? "Data konsumsi pakan tidak valid.",
    );
  }

  const result = await updateFeedConsumption(
    auth.tenantId,
    auth.session.user.id,
    recordId,
    parsed.data,
  );

  if (!result.ok) {
    return apiError(result.error, result.status);
  }

  return apiSuccess({ updated: true }, "Konsumsi pakan berhasil diperbarui.");
}
