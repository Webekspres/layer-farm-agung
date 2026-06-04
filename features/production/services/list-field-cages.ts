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

function startOfTodayUtc() {
  const now = new Date();
  return new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
  );
}

export async function listFieldCages(
  tenantId: string,
): Promise<FieldCageStats> {
  const today = startOfTodayUtc();

  const rows = await prisma.cage.findMany({
    where: {
      status: "Active",
      location: { tenant_id: tenantId },
    },
    include: {
      location: { select: { name: true } },
      strain: { select: { name: true } },
      cycle_settings: {
        where: { status: "Active" },
        take: 1,
        orderBy: { start_date: "desc" },
        select: { initial_population: true },
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

  const cages: FieldCageListItem[] = rows.map((row) => ({
    id: row.id,
    name: row.name,
    locationName: row.location.name,
    strainName: row.strain.name,
    cageType: row.cage_type,
    capacity: row.capacity,
    status: row.status,
    activeCyclePopulation:
      row.cycle_settings[0]?.initial_population ?? null,
    recordedToday: row.daily_productions.length > 0,
  }));

  return {
    cages,
    totalActive: cages.length,
    recordedTodayCount: cages.filter((c) => c.recordedToday).length,
  };
}
