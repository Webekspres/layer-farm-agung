import prisma from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { StrainListItem, StrainsListFilters } from "@/features/strains/types";

import type { PaginationMeta } from "@/lib/pagination";

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

export type PaginatedStrainsResult = {
  items: StrainListItem[];
} & PaginationMeta;

export async function listStrains(
  filters: StrainsListFilters & { page?: number; pageSize?: number } = {},
): Promise<PaginatedStrainsResult> {
  const { page, pageSize, ...searchFilters } = filters;
  const where = buildWhere(searchFilters);

  const includeClause = {
    _count: { select: { cages: true, production_targets: true } },
  } as const;

  if (page !== undefined && pageSize !== undefined) {
    const total = await prisma.strain.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const skip = (safePage - 1) * pageSize;

    const rows = await prisma.strain.findMany({
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
        description: row.description,
        cageCount: row._count.cages,
        targetCount: row._count.production_targets,
      })),
      total,
      page: safePage,
      pageSize,
      totalPages,
    };
  }

  const rows = await prisma.strain.findMany({
    where,
    include: includeClause,
    orderBy: { name: "asc" },
  });

  const mapped = rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    cageCount: row._count.cages,
    targetCount: row._count.production_targets,
  }));

  return {
    items: mapped,
    total: mapped.length,
    page: 1,
    pageSize: mapped.length || 10,
    totalPages: 1,
  };
}

export async function listStrainOptions() {
  return prisma.strain.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}
