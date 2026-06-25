"use server";

import { revalidatePath } from "next/cache";
import {
  getProductionTenantScope,
  requireManageProductionSession,
} from "@/features/production/lib/access";
import { populationMutationSchema } from "@/features/production/schemas/population-mutation";
import { recordPopulationMutation } from "@/features/production/services/record-population-mutation";

export type RecordPopulationMutationState = {
  error?: string;
  success?: boolean;
};

export async function recordPopulationMutationAction(
  _prev: RecordPopulationMutationState,
  formData: FormData,
): Promise<RecordPopulationMutationState> {
  const session = await requireManageProductionSession();
  const { tenantId, needsTenantSelection } = getProductionTenantScope(session);

  if (needsTenantSelection || !tenantId) {
    return { error: "Pilih tenant aktif terlebih dahulu." };
  }

  const parsed = populationMutationSchema.safeParse({
    cageId: formData.get("cageId"),
    mutationType: formData.get("mutationType"),
    quantity: formData.get("quantity"),
    notes: formData.get("notes"),
    recordDate: formData.get("recordDate"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const result = await recordPopulationMutation(
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
