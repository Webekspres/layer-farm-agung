import { getAssignedCageIdsForUser } from "@/features/cages/lib/cage-staff-db";
import { resolveActiveCyclePopulation } from "@/features/cages/services/resolve-active-cycle-population";
import { startOfTodayUtc } from "@/features/production/lib/parse-production-date";
import prisma from "@/lib/prisma";

export type FieldCageListItem = {
  id: string;
  name: string;
  locationName: string;
  strainName: string;
  cageType: string | null;
  capacity: number;
  status: string;
  activeCyclePopulation: number | null;
  /** Whether any production entry exists for this cage today. */
  recordedToday: boolean;
};

export type FieldCageStats = {
  cages: FieldCageListItem[];
  totalActive: number;
  recordedTodayCount: number;
};


export async function listFieldCages(
  tenantId: string,
  userId: string,
): Promise<FieldCageStats> {
  const today = startOfTodayUtc();
  const assignedCageIds = await getAssignedCageIdsForUser(userId);

  if (assignedCageIds.length === 0) {
    return { cages: [], totalActive: 0, recordedTodayCount: 0 };
  }

  const rows = await prisma.cage.findMany({
    where: {
      status: "Active",
      location: { tenant_id: tenantId },
      id: { in: assignedCageIds },
      cycle_settings: { some: { status: "Active" } },
    },
    include: {
      location: { select: { name: true } },
      strain: { select: { name: true } },
      cycle_settings: {
        where: { status: "Active" },
        take: 1,
        orderBy: { start_date: "desc" },
        select: { id: true },
      },
      daily_productions: {
        where: {
          tenant_id: tenantId,
          record_date: today,
        },
        take: 1,
        select: { id: true },
      },
    },
    orderBy: [{ location: { name: "asc" } }, { name: "asc" }],
  });

  const populations = await Promise.all(
    rows.map((row) =>
      row.cycle_settings[0]
        ? resolveActiveCyclePopulation(row.id)
        : Promise.resolve(null),
    ),
  );

  const cages: FieldCageListItem[] = rows.map((row, index) => ({
    id: row.id,
    name: row.name,
    locationName: row.location.name,
    strainName: row.strain.name,
    cageType: row.cage_type,
    capacity: row.capacity,
    status: row.status,
    activeCyclePopulation: populations[index],
    recordedToday: row.daily_productions.length > 0,
  }));

  return {
    cages,
    totalActive: cages.length,
    recordedTodayCount: cages.filter((c) => c.recordedToday).length,
  };
}
