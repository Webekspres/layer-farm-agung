import prisma from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type {
  EggGradeListItem,
  EggGradesListFilters,
} from "@/features/egg-grades/types";

import type { PaginationMeta } from "@/lib/pagination";

function buildWhere({
  search,
  usage,
}: EggGradesListFilters): Prisma.EggGradeWhereInput {
  const and: Prisma.EggGradeWhereInput[] = [];
  const q = search?.trim();

  if (q) {
    and.push({
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { code: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    });
  }

  if (usage === "in_use") {
    and.push({
      OR: [{ sales_order_items: { some: {} } }, { production_items: { some: {} } }],
    });
  } else if (usage === "unused") {
    and.push({
      AND: [{ sales_order_items: { none: {} } }, { production_items: { none: {} } }],
    });
  }

  if (and.length === 0) return {};
  if (and.length === 1) return and[0]!;
  return { AND: and };
}

export type PaginatedEggGradesResult = {
  items: EggGradeListItem[];
} & PaginationMeta;

type EggGradeRow = {
  id: number;
  name: string;
  code: string | null;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  _count: { sales_order_items: number; production_items: number };
};

function toListItem(row: EggGradeRow): EggGradeListItem {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    description: row.description,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    usageCount: row._count.sales_order_items + row._count.production_items,
  };
}

export async function listEggGrades(
  filters: EggGradesListFilters & { page?: number; pageSize?: number } = {},
): Promise<PaginatedEggGradesResult> {
  const { page, pageSize, ...searchFilters } = filters;
  const where = buildWhere(searchFilters);

  const includeClause = {
    _count: {
      select: { sales_order_items: true, production_items: true },
    },
  } as const;

  const orderBy: Prisma.EggGradeOrderByWithRelationInput[] = [
    { sort_order: "asc" },
    { name: "asc" },
  ];

  if (page !== undefined && pageSize !== undefined) {
    const total = await prisma.eggGrade.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const skip = (safePage - 1) * pageSize;

    const rows = await prisma.eggGrade.findMany({
      where,
      include: includeClause,
      orderBy,
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

  const rows = await prisma.eggGrade.findMany({
    where,
    include: includeClause,
    orderBy,
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
