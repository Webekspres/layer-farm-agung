"use server";

import { revalidatePath } from "next/cache";
import {
  getInventoryTenantScope,
  requireManageInventorySession,
} from "@/features/inventory/lib/access";
import { createPurchaseOrderSchema } from "@/features/procurement/schemas/purchase-order";
import { createPurchaseOrder } from "@/features/procurement/services/create-purchase-order";

export type PurchaseOrderFormState = {
  error?: string;
  success?: boolean;
  poId?: string;
};

export async function createPurchaseOrderAction(
  _prev: PurchaseOrderFormState,
  formData: FormData,
): Promise<PurchaseOrderFormState> {
  const session = await requireManageInventorySession();
  const { tenantId, needsTenantSelection } = getInventoryTenantScope(session);

  if (needsTenantSelection || !tenantId) {
    return { error: "Pilih tenant aktif terlebih dahulu." };
  }

  let items: unknown;
  try {
    items = JSON.parse(String(formData.get("itemsJson") ?? "[]"));
  } catch {
    return { error: "Data barang pesanan tidak valid." };
  }

  const parsed = createPurchaseOrderSchema.safeParse({
    vendorId: formData.get("vendorId"),
    orderDate: formData.get("orderDate"),
    items,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Data pesanan tidak valid.",
    };
  }

  const result = await createPurchaseOrder(tenantId, parsed.data);

  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/dashboard/purchase-orders");
  revalidatePath("/dashboard/vendors");
  return { success: true, poId: result.poId };
}
