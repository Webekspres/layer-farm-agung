import prisma from "@/lib/prisma";
import type { ItemType } from "@/generated/prisma/enums";

export type ItemOption = {
  id: string;
  name: string;
  unit: string;
  /**
   * Stock available at the cage's location (or summed across the tenant's
   * locations when no cage is given). Used by mobile pickers to show/validate.
   */
  availableQuantity: number;
  /** Low-stock alert threshold (null when not configured). */
  minStockAlert: number | null;
};

/**
 * Lists tenant items of the given type(s) with their available stock, scoped to
 * a cage's location when `cageId` is provided. Used by staff/mobile pickers
 * (feed for Konsumsi pakan, medicine+vitamin for Pengobatan).
 */
export async function listItemsForCage(
  tenantId: string,
  params: { types: ItemType[]; cageId?: string },
): Promise<ItemOption[]> {
  const { types, cageId } = params;

  if (types.length === 0) return [];

  let locationId: string | null = null;
  if (cageId) {
    const cage = await prisma.cage.findFirst({
      where: { id: cageId, location: { tenant_id: tenantId } },
      select: { location_id: true },
    });
    // Unknown cage → no location scope; still return items with 0 availability.
    locationId = cage?.location_id ?? null;
  }

  const items = await prisma.item.findMany({
    where: {
      tenant_id: tenantId,
      type: { in: types },
    },
    select: {
      id: true,
      name: true,
      unit: true,
      min_stock_alert: true,
      inventory_stocks: {
        where: locationId ? { location_id: locationId } : undefined,
        select: { quantity: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return items.map((item) => ({
    id: item.id,
    name: item.name,
    unit: item.unit,
    minStockAlert: item.min_stock_alert,
    availableQuantity: item.inventory_stocks.reduce(
      (sum, stock) => sum + stock.quantity,
      0,
    ),
  }));
}
