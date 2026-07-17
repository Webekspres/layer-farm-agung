import { isUserAssignedToCage } from "@/features/cages/services/is-user-assigned-to-cage";
import type {
  PendingVaccineScheduleItem,
  VaccineScheduleStatus,
} from "@/features/health/types";
import { formatBusinessDateFromDb } from "@/lib/business-date";
import prisma from "@/lib/prisma";

/**
 * Vaccine schedules for one cage, surfaced to the assigned staff via mobile.
 * Defaults to `Pending` only; pass `status` to look at history instead.
 */
export async function listVaccineSchedulesForCage(
  tenantId: string,
  userId: string,
  cageId: string,
  status: VaccineScheduleStatus = "Pending",
): Promise<PendingVaccineScheduleItem[] | null> {
  const assigned = await isUserAssignedToCage(userId, cageId);

  if (!assigned) {
    return null;
  }

  const cage = await prisma.cage.findFirst({
    where: { id: cageId, location: { tenant_id: tenantId } },
    select: { id: true },
  });

  if (!cage) {
    return null;
  }

  const rows = await prisma.vaccineSchedule.findMany({
    where: { cage_id: cageId, status },
    include: { item: { select: { name: true, unit: true } } },
    orderBy: { scheduled_date: "asc" },
  });

  return rows.map((row) => ({
    id: row.id,
    itemId: row.item_id,
    itemName: row.item.name,
    itemUnit: row.item.unit,
    scheduledDate: formatBusinessDateFromDb(row.scheduled_date),
    status: row.status as VaccineScheduleStatus,
    notes: row.notes,
  }));
}
