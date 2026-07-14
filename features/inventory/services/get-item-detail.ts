import prisma from "@/lib/prisma";
import { isUuid } from "@/lib/uuid";
import { directionOf } from "@/features/inventory/lib/stock-mutation-types";
import type { ItemDetail } from "@/features/inventory/types";

/**
 * Returns an item with its per-location stock and a stock card (kartu stok) of
 * recent IN/OUT mutations. Tenant-scoped; null when the item is not in the tenant.
 */
export async function getItemDetail(
  tenantId: string,
  itemId: string,
): Promise<ItemDetail | null> {
  if (!isUuid(itemId)) return null;

  const item = await prisma.item.findFirst({
    where: { id: itemId, tenant_id: tenantId },
    select: {
      id: true,
      name: true,
      type: true,
      unit: true,
      min_stock_alert: true,
      inventory_stocks: {
        select: {
          location_id: true,
          quantity: true,
          location: { select: { name: true } },
        },
      },
      stock_mutations: {
        orderBy: { mutation_date: "desc" },
        take: 100,
        select: {
          id: true,
          mutation_type: true,
          quantity: true,
          reference_id: true,
          mutation_date: true,
        },
      },
    },
  });

  if (!item) return null;

  const totalQuantity = item.inventory_stocks.reduce(
    (sum, s) => sum + s.quantity,
    0,
  );

  return {
    id: item.id,
    name: item.name,
    type: item.type,
    unit: item.unit,
    minStockAlert: item.min_stock_alert,
    totalQuantity,
    lowStock:
      item.min_stock_alert != null && totalQuantity <= item.min_stock_alert,
    stockByLocation: item.inventory_stocks.map((s) => ({
      locationId: s.location_id,
      locationName: s.location.name,
      quantity: s.quantity,
    })),
    mutations: item.stock_mutations.map((m) => ({
      id: m.id,
      mutationType: m.mutation_type,
      direction: directionOf(m.mutation_type),
      quantity: m.quantity,
      referenceId: m.reference_id,
      mutationDate: m.mutation_date.toISOString(),
    })),
  };
}
