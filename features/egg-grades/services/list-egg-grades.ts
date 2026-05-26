import prisma from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type {
  EggGradeListItem,
  EggGradesListFilters,
} from "@/features/egg-grades/types";

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
        { description: { contains: q, mode: "insensitive" } },
      ],
    });
  }

  if (usage === "in_use") {
    and.push({
      OR: [
        { daily_productions: { some: {} } },
        { sales_order_items: { some: {} } },
      ],
    });
  } else if (usage === "unused") {
    and.push({ daily_productions: { none: {} } });
    and.push({ sales_order_items: { none: {} } });
  }

  if (and.length === 0) return {};
  if (and.length === 1) return and[0]!;
  return { AND: and };
}

export async function listEggGrades(
  filters: EggGradesListFilters = {},
): Promise<EggGradeListItem[]> {
  const rows = await prisma.eggGrade.findMany({
    where: buildWhere(filters),
    include: {
      _count: { select: { daily_productions: true, sales_order_items: true } },
    },
    orderBy: { name: "asc" },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    usageCount: row._count.daily_productions + row._count.sales_order_items,
  }));
}
