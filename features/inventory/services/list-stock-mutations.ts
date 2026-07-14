import prisma from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { directionOf } from "@/features/inventory/lib/stock-mutation-types";
import type {
  StockMutationListFilters,
  StockMutationListItem,
} from "@/features/inventory/types";
import type { PaginationMeta } from "@/lib/pagination";

function endOfDay(date: Date): Date {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
}

function buildWhere(
  tenantId: string,
  { search, type, locationId, from, to }: StockMutationListFilters,
): Prisma.StockMutationWhereInput {
  // StockMutation has no location_id — scope/filter through its Item relation.
  const itemWhere: Prisma.ItemWhereInput = { tenant_id: tenantId };

  const q = search?.trim();
  if (q) {
    itemWhere.name = { contains: q, mode: "insensitive" };
  }

  if (locationId) {
    itemWhere.inventory_stocks = { some: { location_id: locationId } };
  }

  const where: Prisma.StockMutationWhereInput = { item: itemWhere };

  if (type) {
    where.mutation_type = type;
  }

  if (from || to) {
    where.mutation_date = {
      ...(from ? { gte: from } : {}),
      ...(to ? { lte: endOfDay(to) } : {}),
    };
  }

  return where;
}

export type PaginatedStockMutationsResult = {
  items: StockMutationListItem[];
} & PaginationMeta;

function toListItem(row: {
  id: string;
  mutation_type: string;
  quantity: number;
  reference_id: string | null;
  mutation_date: Date;
  item: { id: string; name: string; unit: string };
}): StockMutationListItem {
  return {
    id: row.id,
    itemId: row.item.id,
    itemName: row.item.name,
    unit: row.item.unit,
    mutationType: row.mutation_type,
    direction: directionOf(row.mutation_type),
    quantity: row.quantity,
    referenceId: row.reference_id,
    mutationDate: row.mutation_date.toISOString(),
  };
}

export async function listStockMutations(
  tenantId: string,
  filters: StockMutationListFilters & { page?: number; pageSize?: number } = {},
): Promise<PaginatedStockMutationsResult> {
  const { page, pageSize, ...searchFilters } = filters;
  const where = buildWhere(tenantId, searchFilters);

  const select = {
    id: true,
    mutation_type: true,
    quantity: true,
    reference_id: true,
    mutation_date: true,
    item: { select: { id: true, name: true, unit: true } },
  } as const;

  if (page !== undefined && pageSize !== undefined) {
    const total = await prisma.stockMutation.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const skip = (safePage - 1) * pageSize;

    const rows = await prisma.stockMutation.findMany({
      where,
      select,
      orderBy: { mutation_date: "desc" },
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

  const rows = await prisma.stockMutation.findMany({
    where,
    select,
    orderBy: { mutation_date: "desc" },
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
