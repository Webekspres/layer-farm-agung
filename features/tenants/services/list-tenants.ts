import prisma from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type {
  TenantListItem,
  TenantsListFilters,
} from "@/features/tenants/types";

import type { PaginationMeta } from "@/lib/pagination";

function buildTenantWhere({
  search,
  status = "all",
}: TenantsListFilters): Prisma.TenantWhereInput {
  const where: Prisma.TenantWhereInput = {};

  if (status === "active") {
    where.is_active = true;
  } else if (status === "inactive") {
    where.is_active = false;
  }

  const q = search?.trim();
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
    ];
  }

  return where;
}

export type PaginatedTenantsResult = {
  items: TenantListItem[];
} & PaginationMeta;

export async function listTenants(
  filters: TenantsListFilters & { page?: number; pageSize?: number } = {},
): Promise<PaginatedTenantsResult> {
  const { page, pageSize, ...searchFilters } = filters;
  const where = buildTenantWhere(searchFilters);

  if (page !== undefined && pageSize !== undefined) {
    const total = await prisma.tenant.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const skip = (safePage - 1) * pageSize;

    const rows = await prisma.tenant.findMany({
      where,
      include: { _count: { select: { users: true } } },
      orderBy: { name: "asc" },
      skip,
      take: pageSize,
    });

    return {
      items: rows.map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        isActive: row.is_active,
        userCount: row._count.users,
        createdAt: row.created_at.toISOString(),
      })),
      total,
      page: safePage,
      pageSize,
      totalPages,
    };
  }

  const rows = await prisma.tenant.findMany({
    where,
    include: { _count: { select: { users: true } } },
    orderBy: { name: "asc" },
  });

  const mapped = rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    isActive: row.is_active,
    userCount: row._count.users,
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

export async function listActiveTenantsForSwitcher() {
  return prisma.tenant.findMany({
    where: { is_active: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}
