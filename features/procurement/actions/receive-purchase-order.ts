"use server";

import { revalidatePath } from "next/cache";
import {
  getInventoryTenantScope,
  requireManageInventorySession,
} from "@/features/inventory/lib/access";
import { receivePurchaseOrderSchema } from "@/features/procurement/schemas/purchase-order";
import { receivePurchaseOrder } from "@/features/procurement/services/receive-purchase-order";

export type ReceivePurchaseOrderFormState = {
  error?: string;
  success?: boolean;
};

export async function receivePurchaseOrderAction(
  _prev: ReceivePurchaseOrderFormState,
  formData: FormData,
): Promise<ReceivePurchaseOrderFormState> {
  const session = await requireManageInventorySession();
  const { tenantId, needsTenantSelection } = getInventoryTenantScope(session);

  if (needsTenantSelection || !tenantId) {
    return { error: "Pilih tenant aktif terlebih dahulu." };
  }

  const parsed = receivePurchaseOrderSchema.safeParse({
    poId: formData.get("poId"),
    locationId: formData.get("locationId"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Data penerimaan tidak valid.",
    };
  }

  const result = await receivePurchaseOrder(tenantId, parsed.data);

  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/dashboard/purchase-orders");
  revalidatePath(`/dashboard/purchase-orders/${parsed.data.poId}`);
  revalidatePath("/dashboard/inventory");
  return { success: true };
}
