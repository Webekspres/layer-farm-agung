import prisma from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { VendorListItem, VendorsListFilters } from "@/features/vendors/types";

import type { PaginationMeta } from "@/lib/pagination";

function buildWhere(
  tenantId: string,
  { search, category }: VendorsListFilters,
): Prisma.VendorWhereInput {
  const where: Prisma.VendorWhereInput = { tenant_id: tenantId };

  if (category) {
    where.category = category;
  }

  const q = search?.trim();
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { address: { contains: q, mode: "insensitive" } },
      { category: { contains: q, mode: "insensitive" } },
    ];
  }

  return where;
}

export type PaginatedVendorsResult = {
  items: VendorListItem[];
} & PaginationMeta;

export async function listVendors(
  tenantId: string,
  filters: VendorsListFilters & { page?: number; pageSize?: number } = {},
): Promise<PaginatedVendorsResult> {
  const { page, pageSize, ...searchFilters } = filters;
  const where = buildWhere(tenantId, searchFilters);

  const includeClause = {
    _count: { select: { supplier_contacts: true, purchase_orders: true } },
    supplier_contacts: {
      take: 1,
      orderBy: { pic_name: "asc" },
    },
  } as const;

  if (page !== undefined && pageSize !== undefined) {
    const total = await prisma.vendor.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const skip = (safePage - 1) * pageSize;

    const rows = await prisma.vendor.findMany({
      where,
      include: includeClause,
      orderBy: { name: "asc" },
      skip,
      take: pageSize,
    });

    return {
      items: rows.map((row) => ({
        id: row.id,
        name: row.name,
        category: row.category,
        address: row.address,
        contactCount: row._count.supplier_contacts,
        purchaseOrderCount: row._count.purchase_orders,
        picName: row.supplier_contacts[0]?.pic_name ?? null,
        picPhone: row.supplier_contacts[0]?.phone ?? null,
        createdAt: row.created_at.toISOString(),
      })),
      total,
      page: safePage,
      pageSize,
      totalPages,
    };
  }

  const rows = await prisma.vendor.findMany({
    where,
    include: includeClause,
    orderBy: { name: "asc" },
  });

  const mapped = rows.map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    address: row.address,
    contactCount: row._count.supplier_contacts,
    purchaseOrderCount: row._count.purchase_orders,
    picName: row.supplier_contacts[0]?.pic_name ?? null,
    picPhone: row.supplier_contacts[0]?.phone ?? null,
    createdAt: row.created_at.toISOString(),
  }));

  return {
    items: mapped,
    total: mapped.length,
    page: 1,
    pageSize: mapped.length || 10,
    totalPages: 1,
  };
}
