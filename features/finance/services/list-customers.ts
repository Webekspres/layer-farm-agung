import prisma from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type {
  CustomerListItem,
  CustomersListFilters,
} from "@/features/finance/types";
import type { PaginationMeta } from "@/lib/pagination";

function buildWhere(
  tenantId: string,
  { search }: CustomersListFilters,
): Prisma.CustomerWhereInput {
  const where: Prisma.CustomerWhereInput = { tenant_id: tenantId };

  const q = search?.trim();
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
      { address: { contains: q, mode: "insensitive" } },
    ];
  }

  return where;
}

export type PaginatedCustomersResult = {
  items: CustomerListItem[];
} & PaginationMeta;

function toListItem(row: {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  created_at: Date;
  _count: { sales_orders: number };
}): CustomerListItem {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    address: row.address,
    salesOrderCount: row._count.sales_orders,
    createdAt: row.created_at.toISOString(),
  };
}

export async function listCustomers(
  tenantId: string,
  filters: CustomersListFilters & { page?: number; pageSize?: number } = {},
): Promise<PaginatedCustomersResult> {
  const { page, pageSize, ...searchFilters } = filters;
  const where = buildWhere(tenantId, searchFilters);

  const include = {
    _count: { select: { sales_orders: true } },
  } as const;

  if (page !== undefined && pageSize !== undefined) {
    const total = await prisma.customer.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const skip = (safePage - 1) * pageSize;

    const rows = await prisma.customer.findMany({
      where,
      include,
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

  const rows = await prisma.customer.findMany({
    where,
    include,
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
