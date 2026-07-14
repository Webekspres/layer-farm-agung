import { NextRequest } from "next/server";
import { requireApiPermissionWithTenant } from "@/lib/api/require-api-session";
import { apiError, apiSuccess } from "@/lib/api/response";
import { cageScanSchema } from "@/features/production/schemas/cage-scan";
import { verifyCageScan } from "@/features/production/services/verify-cage-scan";

export async function POST(request: NextRequest) {
  const auth = await requireApiPermissionWithTenant("manage_production");

  if (auth.error) {
    return auth.error;
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return apiError("Body JSON tidak valid.", 400);
  }

  const parsed = cageScanSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(
      parsed.error.issues[0]?.message ?? "Payload tidak valid.",
      400,
    );
  }

  const result = await verifyCageScan(
    auth.tenantId,
    auth.session.user.id,
    parsed.data.payload,
  );

  if (!result.ok) {
    return apiError(result.error, result.status);
  }

  return apiSuccess(result.cage, "Kandang valid untuk input produksi.");
}
