"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
  getInventoryTenantScope,
  requireManageInventorySession,
} from "@/features/inventory/lib/access";
import { EGG_LEDGER_MANAGED_MESSAGE } from "@/features/inventory/lib/saprodi-item-types";
import { stockAdjustmentSchema } from "@/features/inventory/schemas/item";
import { applyStockMutation } from "@/features/inventory/services/apply-stock-mutation";
import { StockMutationType } from "@/features/inventory/lib/stock-mutation-types";
import type { ItemFormState } from "@/features/inventory/actions/create-item";

class StockError extends Error {}

/**
 * Manual stock adjustment (penyesuaian stok). Writes an IN_ADJUSTMENT /
 * OUT_ADJUSTMENT `StockMutation` via the shared service and updates
 * `InventoryStock`, all tenant-scoped. This is also the primary way `Other`
 * items and supplier purchases move until procurement (Module 7) lands.
 */
export async function adjustStockAction(
  _prev: ItemFormState,
  formData: FormData,
): Promise<ItemFormState> {
  const session = await requireManageInventorySession();
  const { tenantId, needsTenantSelection } = getInventoryTenantScope(session);

  if (needsTenantSelection || !tenantId) {
    return { error: "Pilih tenant aktif terlebih dahulu." };
  }

  const parsed = stockAdjustmentSchema.safeParse({
    itemId: formData.get("itemId"),
    locationId: formData.get("locationId"),
    direction: formData.get("direction"),
    quantity: formData.get("quantity"),
    note: formData.get("note"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const { itemId, locationId, direction, quantity } = parsed.data;

  // Verify item and location both belong to the active tenant.
  const [item, location] = await Promise.all([
    prisma.item.findFirst({
      where: { id: itemId, tenant_id: tenantId },
      select: { id: true, type: true },
    }),
    prisma.location.findFirst({
      where: { id: locationId, tenant_id: tenantId },
      select: { id: true },
    }),
  ]);

  if (!item) return { error: "Item tidak ditemukan." };
  if (item.type === "Egg") {
    return { error: EGG_LEDGER_MANAGED_MESSAGE };
  }
  if (!location) return { error: "Lokasi tidak ditemukan di tenant ini." };

  try {
    await prisma.$transaction(async (tx) => {
      const result = await applyStockMutation(tx, {
        itemId,
        locationId,
        mutationType:
          direction === "IN"
            ? StockMutationType.IN_ADJUSTMENT
            : StockMutationType.OUT_ADJUSTMENT,
        quantity,
      });

      if (!result.ok) {
        throw new StockError(result.error);
      }
    });
  } catch (error) {
    if (error instanceof StockError) {
      return { error: error.message };
    }
    return { error: "Gagal menyimpan penyesuaian stok." };
  }

  revalidatePath("/dashboard/inventory");
  revalidatePath(`/dashboard/inventory/${itemId}`);
  return { success: true };
}
