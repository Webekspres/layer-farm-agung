import prisma from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type {
  LocationListItem,
  LocationsListFilters,
} from "@/features/locations/types";

import type { PaginationMeta } from "@/lib/pagination";

function buildWhere(
  tenantId: string,
  { search, occupancy }: LocationsListFilters,
): Prisma.LocationWhereInput {
  const where: Prisma.LocationWhereInput = { tenant_id: tenantId };
  const q = search?.trim();
  if (q) {
    where.name = { contains: q, mode: "insensitive" };
  }

  if (occupancy === "with_cages") {
    where.cages = { some: {} };
  } else if (occupancy === "empty") {
    where.cages = { none: {} };
  }

  return where;
}

export type PaginatedLocationsResult = {
  items: LocationListItem[];
} & PaginationMeta;

export async function listLocations(
  tenantId: string,
  filters: LocationsListFilters & { page?: number; pageSize?: number } = {},
): Promise<PaginatedLocationsResult> {
  const { page, pageSize, ...searchFilters } = filters;
  const where = buildWhere(tenantId, searchFilters);

  if (page !== undefined && pageSize !== undefined) {
    const total = await prisma.location.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const skip = (safePage - 1) * pageSize;

    const rows = await prisma.location.findMany({
      where,
      include: { _count: { select: { cages: true } } },
      orderBy: { name: "asc" },
      skip,
      take: pageSize,
    });

    return {
      items: rows.map((row) => ({
        id: row.id,
        name: row.name,
        cageCount: row._count.cages,
        createdAt: row.created_at.toISOString(),
      })),
      total,
      page: safePage,
      pageSize,
      totalPages,
    };
  }

  const rows = await prisma.location.findMany({
    where,
    include: { _count: { select: { cages: true } } },
    orderBy: { name: "asc" },
  });

  const mapped = rows.map((row) => ({
    id: row.id,
    name: row.name,
    cageCount: row._count.cages,
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

export async function listLocationOptions(tenantId: string) {
  return prisma.location.findMany({
    where: { tenant_id: tenantId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}
