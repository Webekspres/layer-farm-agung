import prisma from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { CageListItem, CagesListFilters } from "@/features/cages/types";

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

export async function listCages(
  tenantId: string,
  filters: CagesListFilters = {},
): Promise<CageListItem[]> {
  const rows = await prisma.cage.findMany({
    where: buildWhere(tenantId, filters),
    include: {
      location: { select: { id: true, name: true } },
      strain: { select: { id: true, name: true } },
      cycle_settings: {
        where: { status: "Active" },
        take: 1,
        orderBy: { start_date: "desc" },
        select: { initial_population: true },
      },
    },
    orderBy: [{ location: { name: "asc" } }, { name: "asc" }],
  });

  return rows.map((row) => ({
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
}
