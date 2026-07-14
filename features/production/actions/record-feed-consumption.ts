"use server";

import { revalidatePath } from "next/cache";
import {
  getProductionTenantScope,
  requireManageProductionSession,
} from "@/features/production/lib/access";
import { feedConsumptionSchema } from "@/features/production/schemas/feed-consumption";
import { recordFeedConsumption } from "@/features/production/services/record-feed-consumption";

export type RecordFeedConsumptionState = {
  error?: string;
  success?: boolean;
};

export async function recordFeedConsumptionAction(
  _prev: RecordFeedConsumptionState,
  formData: FormData,
): Promise<RecordFeedConsumptionState> {
  const session = await requireManageProductionSession();
  const { tenantId, needsTenantSelection } = getProductionTenantScope(session);

  if (needsTenantSelection || !tenantId) {
    return { error: "Pilih tenant aktif terlebih dahulu." };
  }

  const parsed = feedConsumptionSchema.safeParse({
    cageId: formData.get("cageId"),
    itemId: formData.get("itemId"),
    recordDate: formData.get("recordDate"),
    quantity: formData.get("quantity"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const result = await recordFeedConsumption(
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
