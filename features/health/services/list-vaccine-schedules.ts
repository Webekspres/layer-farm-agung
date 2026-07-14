import prisma from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type {
  VaccineScheduleListFilters,
  VaccineScheduleListItem,
  VaccineScheduleStatus,
} from "@/features/health/types";
import { formatBusinessDateFromDb } from "@/lib/business-date";
import type { PaginationMeta } from "@/lib/pagination";

function buildWhere(
  tenantId: string,
  { search, status }: VaccineScheduleListFilters,
): Prisma.VaccineScheduleWhereInput {
  const where: Prisma.VaccineScheduleWhereInput = {
    cage: { location: { tenant_id: tenantId } },
  };

  if (status) {
    where.status = status;
  }

  const q = search?.trim();
  if (q) {
    where.OR = [
      { cage: { name: { contains: q, mode: "insensitive" } } },
      { item: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  return where;
}

export type PaginatedVaccineSchedulesResult = {
  items: VaccineScheduleListItem[];
} & PaginationMeta;

function toListItem(row: {
  id: string;
  scheduled_date: Date;
  status: string;
  notes: string | null;
  quantity_used: number | null;
  completed_at: Date | null;
  created_at: Date;
  cage: { id: string; name: string; location: { name: string } };
  item: { id: string; name: string; unit: string };
}): VaccineScheduleListItem {
  return {
    id: row.id,
    cageId: row.cage.id,
    cageName: row.cage.name,
    locationName: row.cage.location.name,
    itemId: row.item.id,
    itemName: row.item.name,
    itemUnit: row.item.unit,
    scheduledDate: formatBusinessDateFromDb(row.scheduled_date),
    status: row.status as VaccineScheduleStatus,
    notes: row.notes,
    quantityUsed: row.quantity_used,
    completedAt: row.completed_at?.toISOString() ?? null,
    createdAt: row.created_at.toISOString(),
  };
}

export async function listVaccineSchedules(
  tenantId: string,
  filters: VaccineScheduleListFilters & { page?: number; pageSize?: number } = {},
): Promise<PaginatedVaccineSchedulesResult> {
  const { page, pageSize, ...searchFilters } = filters;
  const where = buildWhere(tenantId, searchFilters);

  const include = {
    cage: { select: { id: true, name: true, location: { select: { name: true } } } },
    item: { select: { id: true, name: true, unit: true } },
  } as const;

  const orderBy: Prisma.VaccineScheduleOrderByWithRelationInput[] = [
    { scheduled_date: "asc" },
    { created_at: "asc" },
  ];

  if (page !== undefined && pageSize !== undefined) {
    const total = await prisma.vaccineSchedule.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const skip = (safePage - 1) * pageSize;

    const rows = await prisma.vaccineSchedule.findMany({
      where,
      include,
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

  const rows = await prisma.vaccineSchedule.findMany({ where, include, orderBy });
  const mapped = rows.map(toListItem);

  return {
    items: mapped,
    total: mapped.length,
    page: 1,
    pageSize: mapped.length || 10,
    totalPages: 1,
  };
}
