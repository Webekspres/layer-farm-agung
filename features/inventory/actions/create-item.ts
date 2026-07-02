"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
  getInventoryTenantScope,
  requireManageInventorySession,
} from "@/features/inventory/lib/access";
import { itemSchema } from "@/features/inventory/schemas/item";

export type ItemFormState = {
  error?: string;
  success?: boolean;
};

export async function createItemAction(
  _prev: ItemFormState,
  formData: FormData,
): Promise<ItemFormState> {
  const session = await requireManageInventorySession();
  const { tenantId, needsTenantSelection } = getInventoryTenantScope(session);

  if (needsTenantSelection || !tenantId) {
    return { error: "Pilih tenant aktif terlebih dahulu." };
  }

  const parsed = itemSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    unit: formData.get("unit"),
    minStockAlert: formData.get("minStockAlert"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  try {
    await prisma.item.create({
      data: {
        tenant_id: tenantId,
        name: parsed.data.name,
        type: parsed.data.type,
        unit: parsed.data.unit,
        min_stock_alert: parsed.data.minStockAlert ?? null,
      },
    });
  } catch {
    return { error: "Gagal menambahkan item." };
  }

  revalidatePath("/dashboard/inventory");
  return { success: true };
}
