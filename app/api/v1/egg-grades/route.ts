import { NextRequest } from "next/server";
import { listEggGradeOptions } from "@/features/egg-grades/services/list-egg-grade-options";
import { requireApiPermission } from "@/lib/api/require-api-session";
import { apiSuccess } from "@/lib/api/response";

export async function GET(_request: NextRequest) {
  const auth = await requireApiPermission("manage_production");

  if (auth.error) {
    return auth.error;
  }

  const grades = await listEggGradeOptions();

  return apiSuccess(grades, "Daftar grade telur berhasil dimuat.");
}
