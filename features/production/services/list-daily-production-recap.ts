import { cycleAgeInWeeks } from "@/features/cages/lib/cycle-age-weeks";
import { resolveActiveCyclePopulation } from "@/features/cages/services/resolve-active-cycle-population";
import { lookupTargetHdp } from "@/features/dashboard/services/get-dashboard-stats";
import { computeHdpPercent } from "@/features/production/lib/compute-hdp";
import { startOfTodayUtc } from "@/features/production/lib/parse-production-date";
import prisma from "@/lib/prisma";

export type DailyProductionRecapRow = {
  id: string;
  recordDate: Date;
  cageId: string;
  cageName: string;
  locationName: string;
  tb: number;
  tr: number;
  tp: number;
  hdpPercent: number | null;
  targetHdp: number | null;
  recordedBy: string;
  createdAt: Date;
};

export async function listDailyProductionRecap(
  tenantId: string,
  recordDate = startOfTodayUtc(),
): Promise<DailyProductionRecapRow[]> {
  const rows = await prisma.dailyProduction.findMany({
    where: {
      tenant_id: tenantId,
      record_date: recordDate,
    },
    include: {
      cage: {
        select: {
          id: true,
          name: true,
          strain_id: true,
          location: { select: { name: true } },
          cycle_settings: {
            where: { status: "Active" },
            take: 1,
            orderBy: { start_date: "desc" },
            select: { start_date: true },
          },
        },
      },
      user: { select: { full_name: true, username: true } },
    },
    orderBy: [{ cage: { name: "asc" } }, { created_at: "asc" }],
  });

  const recapRows: DailyProductionRecapRow[] = [];

  for (const row of rows) {
    const population = await resolveActiveCyclePopulation(
      row.cage.id,
      recordDate,
    );
    const hdpPercent = computeHdpPercent(row.tb, population ?? 0);

    const activeCycle = row.cage.cycle_settings[0];
    let targetHdp: number | null = null;

    if (activeCycle) {
      const ageWeeks = cycleAgeInWeeks(activeCycle.start_date, recordDate);
      targetHdp = await lookupTargetHdp(row.cage.strain_id, ageWeeks);
    }

    recapRows.push({
      id: row.id,
      recordDate: row.record_date,
      cageId: row.cage.id,
      cageName: row.cage.name,
      locationName: row.cage.location.name,
      tb: row.tb,
      tr: row.tr,
      tp: row.tp,
      hdpPercent,
      targetHdp,
      recordedBy: row.user.full_name || row.user.username,
      createdAt: row.created_at,
    });
  }

  return recapRows;
}
