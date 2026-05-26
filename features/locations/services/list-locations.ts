import prisma from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type {
  LocationListItem,
  LocationsListFilters,
} from "@/features/locations/types";

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

export async function listLocations(
  tenantId: string,
  filters: LocationsListFilters = {},
): Promise<LocationListItem[]> {
  const rows = await prisma.location.findMany({
    where: buildWhere(tenantId, filters),
    include: { _count: { select: { cages: true } } },
    orderBy: { name: "asc" },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    cageCount: row._count.cages,
    createdAt: row.created_at.toISOString(),
  }));
}

export async function listLocationOptions(tenantId: string) {
  return prisma.location.findMany({
    where: { tenant_id: tenantId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}
