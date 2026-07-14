"use server";

import { revalidatePath } from "next/cache";
import {
  getFinanceTenantScope,
  requireViewCashflowSession,
} from "@/features/finance/lib/access";
import { createSalesOrderSchema } from "@/features/finance/schemas/sales-order";
import { createSalesOrder } from "@/features/finance/services/create-sales-order";

export type SalesOrderFormState = {
  error?: string;
  success?: boolean;
  saleId?: string;
};

export async function createSalesOrderAction(
  _prev: SalesOrderFormState,
  formData: FormData,
): Promise<SalesOrderFormState> {
  const session = await requireViewCashflowSession();
  const { tenantId, needsTenantSelection } = getFinanceTenantScope(session);

  if (needsTenantSelection || !tenantId) {
    return { error: "Pilih tenant aktif terlebih dahulu." };
  }

  let items: unknown;
  try {
    items = JSON.parse(String(formData.get("itemsJson") ?? "[]"));
  } catch {
    return { error: "Data baris penjualan tidak valid." };
  }

  const parsed = createSalesOrderSchema.safeParse({
    customerId: formData.get("customerId"),
    locationId: formData.get("locationId"),
    saleDate: formData.get("saleDate"),
    items,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Data penjualan tidak valid.",
    };
  }

  const result = await createSalesOrder(tenantId, parsed.data);

  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/dashboard/finance");
  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard/inventory/mutations");
  return { success: true, saleId: result.saleId };
}
