import { NextRequest } from "next/server";
import { requireApiPermissionWithTenant } from "@/lib/api/require-api-session";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/response";
import { updatePopulationMutationSchema } from "@/features/production/schemas/update-population-mutation";
import { deleteRecordSchema } from "@/features/production/schemas/delete-record";
import { updatePopulationMutation } from "@/features/production/services/update-population-mutation";
import { deletePopulationMutation } from "@/features/production/services/delete-population-mutation";

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

  const parsed = updatePopulationMutationSchema.safeParse(body);

  if (!parsed.success) {
    return apiValidationError(
      parsed.error.issues[0]?.message ?? "Data mutasi populasi tidak valid.",
    );
  }

  const result = await updatePopulationMutation(
    auth.tenantId,
    auth.session.user.id,
    recordId,
    parsed.data,
  );

  if (!result.ok) {
    return apiError(result.error, result.status);
  }

  return apiSuccess(
    {
      updated: true,
      correctionId: result.correctionId,
      idempotent: result.idempotent,
    },
    "Mutasi populasi berhasil diperbarui.",
  );
}

export async function DELETE(request: NextRequest, context: RouteContext) {
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

  const parsed = deleteRecordSchema.safeParse(body);

  if (!parsed.success) {
    return apiValidationError(
      parsed.error.issues[0]?.message ?? "Data koreksi tidak valid.",
    );
  }

  const result = await deletePopulationMutation(
    auth.tenantId,
    auth.session.user.id,
    recordId,
    parsed.data,
  );

  if (!result.ok) {
    return apiError(result.error, result.status);
  }

  return apiSuccess(
    {
      deleted: true,
      correctionId: result.correctionId,
      idempotent: result.idempotent,
    },
    "Mutasi populasi berhasil dihapus.",
  );
}
