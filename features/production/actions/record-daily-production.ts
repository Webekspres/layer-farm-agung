"use server";

import { revalidatePath } from "next/cache";
import {
  getProductionTenantScope,
  requireManageProductionSession,
} from "@/features/production/lib/access";
import { dailyProductionSchema } from "@/features/production/schemas/daily-production";
import { recordDailyProduction } from "@/features/production/services/record-daily-production";

export type RecordDailyProductionState = {
  error?: string;
  success?: boolean;
};

export async function recordDailyProductionAction(
  _prev: RecordDailyProductionState,
  formData: FormData,
): Promise<RecordDailyProductionState> {
  const session = await requireManageProductionSession();
  const { tenantId, needsTenantSelection } = getProductionTenantScope(session);

  if (needsTenantSelection || !tenantId) {
    return {
      error: "Pilih tenant aktif terlebih dahulu (akun global).",
    };
  }

  // Entri per grade aktif: field form bernama `grade_<eggGradeId>` (nilai = butir).
  const entries: { eggGradeId: number; quantity: number }[] = [];
  for (const [key, value] of formData.entries()) {
    const match = /^grade_(\d+)$/.exec(key);
    if (!match) continue;
    const quantity = Number(value);
    if (Number.isFinite(quantity) && quantity > 0) {
      entries.push({ eggGradeId: Number(match[1]), quantity });
    }
  }

  const parsed = dailyProductionSchema.safeParse({
    cageId: formData.get("cageId"),
    recordDate: formData.get("recordDate"),
    entries,
    weight: formData.get("weight"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Data tidak valid.",
    };
  }

  const result = await recordDailyProduction(
    tenantId,
    session.user.id,
    parsed.data,
  );

  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/dashboard/production");

  return { success: true };
}
