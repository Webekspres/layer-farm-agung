import { NextRequest } from "next/server";
import { requireApiPermissionWithTenant } from "@/lib/api/require-api-session";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/response";
import { medicalRecordSchema } from "@/features/production/schemas/medical-record";
import { recordMedicalRecord } from "@/features/production/services/record-medical-record";

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

  const parsed = medicalRecordSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(
      parsed.error.issues[0]?.message ?? "Data pengobatan tidak valid.",
    );
  }

  const result = await recordMedicalRecord(
    auth.tenantId,
    auth.session.user.id,
    parsed.data,
  );

  if (!result.ok) {
    return apiError(result.error, 400);
  }

  const message = result.idempotent
    ? "Catatan pengobatan sudah tercatat sebelumnya."
    : result.lowStock
      ? "Catatan pengobatan berhasil dicatat. Peringatan: stok obat/vitamin sudah di bawah ambang batas."
      : "Catatan pengobatan berhasil dicatat.";

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
