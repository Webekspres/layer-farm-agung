"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
  getInventoryTenantScope,
  requireManageInventorySession,
} from "@/features/inventory/lib/access";
import { updateItemSchema } from "@/features/inventory/schemas/item";
import type { ItemFormState } from "@/features/inventory/actions/create-item";

export async function updateItemAction(
  _prev: ItemFormState,
  formData: FormData,
): Promise<ItemFormState> {
  const session = await requireManageInventorySession();
  const { tenantId, needsTenantSelection } = getInventoryTenantScope(session);

  if (needsTenantSelection || !tenantId) {
    return { error: "Pilih tenant aktif terlebih dahulu." };
  }

  const parsed = updateItemSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    type: formData.get("type"),
    unit: formData.get("unit"),
    minStockAlert: formData.get("minStockAlert"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const existing = await prisma.item.findFirst({
    where: { id: parsed.data.id, tenant_id: tenantId },
    select: { id: true },
  });

  if (!existing) {
    return { error: "Item tidak ditemukan." };
  }

  try {
    await prisma.item.update({
      where: { id: parsed.data.id },
      data: {
        name: parsed.data.name,
        type: parsed.data.type,
        unit: parsed.data.unit,
        min_stock_alert: parsed.data.minStockAlert ?? null,
      },
    });
  } catch {
    return { error: "Gagal memperbarui item." };
  }

  revalidatePath("/dashboard/inventory");
  revalidatePath(`/dashboard/inventory/${parsed.data.id}`);
  return { success: true };
}
