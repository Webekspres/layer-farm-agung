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

  const parsed = dailyProductionSchema.safeParse({
    cageId: formData.get("cageId"),
    recordDate: formData.get("recordDate"),
    tb: formData.get("tb") ?? "0",
    tr: formData.get("tr") ?? "0",
    tp: formData.get("tp") ?? "0",
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
