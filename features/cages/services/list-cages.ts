import prisma from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { CageListItem, CagesListFilters } from "@/features/cages/types";

import type { PaginationMeta } from "@/lib/pagination";

function buildWhere(
  tenantId: string,
  { search, locationId, strainId, status }: CagesListFilters,
): Prisma.CageWhereInput {
  const where: Prisma.CageWhereInput = {
    location: { tenant_id: tenantId },
  };

  if (locationId) {
    where.location_id = locationId;
  }

  if (strainId) {
    where.strain_id = strainId;
  }

  if (status) {
    where.status = status;
  }

  const q = search?.trim();
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { cage_type: { contains: q, mode: "insensitive" } },
      { strain: { name: { contains: q, mode: "insensitive" } } },
      { location: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  return where;
}

export type PaginatedCagesResult = {
  items: CageListItem[];
} & PaginationMeta;

export async function listCages(
  tenantId: string,
  filters: CagesListFilters & { page?: number; pageSize?: number } = {},
): Promise<PaginatedCagesResult> {
  const { page, pageSize, ...searchFilters } = filters;
  const where = buildWhere(tenantId, searchFilters);

  const includeClause = {
    location: { select: { id: true, name: true } },
    strain: { select: { id: true, name: true } },
    cycle_settings: {
      where: { status: "Active" },
      take: 1,
      orderBy: { start_date: "desc" },
      select: { initial_population: true },
    },
  } as const;

  if (page !== undefined && pageSize !== undefined) {
    const total = await prisma.cage.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const skip = (safePage - 1) * pageSize;

    const rows = await prisma.cage.findMany({
      where,
      include: includeClause,
      orderBy: [{ location: { name: "asc" } }, { name: "asc" }],
      skip,
      take: pageSize,
    });

    return {
      items: rows.map((row) => ({
        id: row.id,
        name: row.name,
        locationId: row.location.id,
        locationName: row.location.name,
        strainId: row.strain.id,
        strainName: row.strain.name,
        cageType: row.cage_type,
        capacity: row.capacity,
        status: row.status,
        activeCyclePopulation:
          row.cycle_settings[0]?.initial_population ?? null,
      })),
      total,
      page: safePage,
      pageSize,
      totalPages,
    };
  }

  const rows = await prisma.cage.findMany({
    where,
    include: includeClause,
    orderBy: [{ location: { name: "asc" } }, { name: "asc" }],
  });

  const mapped = rows.map((row) => ({
    id: row.id,
    name: row.name,
    locationId: row.location.id,
    locationName: row.location.name,
    strainId: row.strain.id,
    strainName: row.strain.name,
    cageType: row.cage_type,
    capacity: row.capacity,
    status: row.status,
    activeCyclePopulation:
      row.cycle_settings[0]?.initial_population ?? null,
  }));

  return {
    items: mapped,
    total: mapped.length,
    page: 1,
    pageSize: mapped.length || 10,
    totalPages: 1,
  };
}
