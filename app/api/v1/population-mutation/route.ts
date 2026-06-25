import { NextRequest } from "next/server";
import { requireApiPermissionWithTenant } from "@/lib/api/require-api-session";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/response";
import { populationMutationSchema } from "@/features/production/schemas/population-mutation";
import { recordPopulationMutation } from "@/features/production/services/record-population-mutation";

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

  const parsed = populationMutationSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(
      parsed.error.issues[0]?.message ?? "Data mutasi populasi tidak valid.",
    );
  }

  const result = await recordPopulationMutation(
    auth.tenantId,
    auth.session.user.id,
    parsed.data,
  );

  if (!result.ok) {
    return apiError(result.error, 400);
  }

  return apiSuccess({ recorded: true }, "Mutasi populasi berhasil dicatat.", 201);
}
