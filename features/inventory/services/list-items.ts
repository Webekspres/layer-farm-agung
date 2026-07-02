import prisma from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { ItemListItem, InventoryListFilters } from "@/features/inventory/types";
import type { PaginationMeta } from "@/lib/pagination";

function buildWhere(
  tenantId: string,
  { search, type }: InventoryListFilters,
): Prisma.ItemWhereInput {
  const where: Prisma.ItemWhereInput = { tenant_id: tenantId };

  if (type) {
    where.type = type;
  }

  const q = search?.trim();
  if (q) {
    where.name = { contains: q, mode: "insensitive" };
  }

  return where;
}

export type PaginatedItemsResult = { items: ItemListItem[] } & PaginationMeta;

function toListItem(row: {
  id: string;
  name: string;
  type: ItemListItem["type"];
  unit: string;
  min_stock_alert: number | null;
  created_at: Date;
  inventory_stocks: { quantity: number }[];
}): ItemListItem {
  const totalQuantity = row.inventory_stocks.reduce(
    (sum, s) => sum + s.quantity,
    0,
  );
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    unit: row.unit,
    minStockAlert: row.min_stock_alert,
    totalQuantity,
    lowStock:
      row.min_stock_alert != null && totalQuantity <= row.min_stock_alert,
    createdAt: row.created_at.toISOString(),
  };
}

export async function listItems(
  tenantId: string,
  filters: InventoryListFilters & { page?: number; pageSize?: number } = {},
): Promise<PaginatedItemsResult> {
  const { page, pageSize, ...searchFilters } = filters;
  const where = buildWhere(tenantId, searchFilters);

  const select = {
    id: true,
    name: true,
    type: true,
    unit: true,
    min_stock_alert: true,
    created_at: true,
    inventory_stocks: { select: { quantity: true } },
  } as const;

  if (page !== undefined && pageSize !== undefined) {
    const total = await prisma.item.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const skip = (safePage - 1) * pageSize;

    const rows = await prisma.item.findMany({
      where,
      select,
      orderBy: { name: "asc" },
      skip,
      take: pageSize,
    });

    return {
      items: rows.map(toListItem),
      total,
      page: safePage,
      pageSize,
      totalPages,
    };
  }

  const rows = await prisma.item.findMany({
    where,
    select,
    orderBy: { name: "asc" },
  });
  const mapped = rows.map(toListItem);

  return {
    items: mapped,
    total: mapped.length,
    page: 1,
    pageSize: mapped.length || 10,
    totalPages: 1,
  };
}
