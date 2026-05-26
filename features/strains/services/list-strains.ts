import prisma from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { StrainListItem, StrainsListFilters } from "@/features/strains/types";

function buildWhere({
  search,
  usage,
}: StrainsListFilters): Prisma.StrainWhereInput {
  const where: Prisma.StrainWhereInput = {};
  const q = search?.trim();

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  if (usage === "in_use") {
    where.cages = { some: {} };
  } else if (usage === "unused") {
    where.cages = { none: {} };
  }

  return where;
}

export async function listStrains(
  filters: StrainsListFilters = {},
): Promise<StrainListItem[]> {
  const rows = await prisma.strain.findMany({
    where: buildWhere(filters),
    include: {
      _count: { select: { cages: true, production_targets: true } },
    },
    orderBy: { name: "asc" },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    cageCount: row._count.cages,
    targetCount: row._count.production_targets,
  }));
}

export async function listStrainOptions() {
  return prisma.strain.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}
