"use server";

import { revalidatePath } from "next/cache";
import {
  getInventoryTenantScope,
  requireManageInventorySession,
} from "@/features/inventory/lib/access";
import { cancelPurchaseOrderSchema } from "@/features/procurement/schemas/purchase-order";
import { cancelPurchaseOrder } from "@/features/procurement/services/cancel-purchase-order";

export type CancelPurchaseOrderFormState = {
  error?: string;
  success?: boolean;
};

export async function cancelPurchaseOrderAction(
  _prev: CancelPurchaseOrderFormState,
  formData: FormData,
): Promise<CancelPurchaseOrderFormState> {
  const session = await requireManageInventorySession();
  const { tenantId, needsTenantSelection } = getInventoryTenantScope(session);

  if (needsTenantSelection || !tenantId) {
    return { error: "Pilih tenant aktif terlebih dahulu." };
  }

  const parsed = cancelPurchaseOrderSchema.safeParse({
    poId: formData.get("poId"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Data pesanan tidak valid.",
    };
  }

  const result = await cancelPurchaseOrder(tenantId, parsed.data);

  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/dashboard/purchase-orders");
  revalidatePath(`/dashboard/purchase-orders/${parsed.data.poId}`);
  return { success: true };
}
