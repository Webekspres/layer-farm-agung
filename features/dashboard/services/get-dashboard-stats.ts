import { resolveActiveCyclePopulation } from "@/features/cages/services/resolve-active-cycle-population";
import { cycleAgeInWeeks } from "@/features/cages/lib/cycle-age-weeks";
import { computeHdpPercent } from "@/features/production/lib/compute-hdp";
import { startOfTodayUtc } from "@/features/production/lib/parse-production-date";
import prisma from "@/lib/prisma";

/** Below this fraction of target HDP a cage is flagged as an early warning. */
const HDP_WARNING_THRESHOLD_RATIO = 0.9;
const MAX_EARLY_WARNINGS = 5;

export type DashboardEarlyWarning = {
  cageId: string;
  cageName: string;
  actualHdp: number;
  targetHdp: number;
};

export type DashboardStats = {
  todayEggTotal: number;
  activePopulationTotal: number;
  lowStockItemCount: number;
  activeUserCount: number;
  lowStockItems: {
    id: string;
    name: string;
    totalQuantity: number;
    unit: string;
    minStockAlert: number;
  }[];
  earlyWarnings: DashboardEarlyWarning[];
};

export async function getDashboardStats(
  tenantId: string,
  recordDate = startOfTodayUtc(),
): Promise<DashboardStats> {
  const [prodAgg, cageProdGroups, items, activeCages, activeUserCount] =
    await Promise.all([
      prisma.dailyProduction.aggregate({
        where: { tenant_id: tenantId, record_date: recordDate },
        _sum: { tb: true },
      }),
      prisma.dailyProduction.groupBy({
        by: ["cage_id"],
        where: { tenant_id: tenantId, record_date: recordDate },
        _sum: { tb: true },
      }),
      prisma.item.findMany({
        where: { tenant_id: tenantId },
        select: {
          id: true,
          name: true,
          unit: true,
          min_stock_alert: true,
          inventory_stocks: { select: { quantity: true } },
        },
        orderBy: { name: "asc" },
      }),
      prisma.cage.findMany({
        where: {
          status: "Active",
          location: { tenant_id: tenantId },
          cycle_settings: { some: { status: "Active" } },
        },
        select: {
          id: true,
          name: true,
          strain_id: true,
          cycle_settings: {
            where: { status: "Active" },
            take: 1,
            orderBy: { start_date: "desc" },
            select: { start_date: true },
          },
        },
      }),
      prisma.user.count({
        where: { tenant_id: tenantId, is_active: true },
      }),
    ]);

  const cageTbById = new Map(
    cageProdGroups.map((row) => [row.cage_id, row._sum.tb ?? 0]),
  );

  const cagePopulations = await Promise.all(
    activeCages.map((cage) =>
      resolveActiveCyclePopulation(cage.id, recordDate),
    ),
  );

  const activePopulationTotal = cagePopulations.reduce<number>(
    (sum, value) => sum + (value ?? 0),
    0,
  );

  const earlyWarnings: DashboardEarlyWarning[] = [];

  for (let i = 0; i < activeCages.length; i++) {
    const cage = activeCages[i]!;
    const activeCycle = cage.cycle_settings[0];
    if (!activeCycle) continue;

    const population = cagePopulations[i];
    const tb = cageTbById.get(cage.id) ?? 0;
    const actualHdp = computeHdpPercent(tb, population ?? 0);
    if (actualHdp === null) continue;

    const ageWeeks = cycleAgeInWeeks(activeCycle.start_date, recordDate);
    const targetHdp = await lookupTargetHdp(cage.strain_id, ageWeeks);
    if (targetHdp === null) continue;

    if (actualHdp < targetHdp * HDP_WARNING_THRESHOLD_RATIO) {
      earlyWarnings.push({
        cageId: cage.id,
        cageName: cage.name,
        actualHdp,
        targetHdp,
      });
    }
  }

  const lowStockAll = items
    .map((item) => {
      const totalQuantity = item.inventory_stocks.reduce(
        (sum, stock) => sum + stock.quantity,
        0,
      );
      return {
        id: item.id,
        name: item.name,
        totalQuantity,
        unit: item.unit,
        minStockAlert: item.min_stock_alert ?? 0,
      };
    })
    .filter(
      (item) =>
        item.minStockAlert > 0 && item.totalQuantity <= item.minStockAlert,
    );

  const lowStockItems = lowStockAll.slice(0, 5);

  return {
    todayEggTotal: prodAgg._sum.tb ?? 0,
    activePopulationTotal,
    lowStockItemCount: lowStockAll.length,
    activeUserCount,
    lowStockItems: lowStockItems.map((item) => ({
      id: item.id,
      name: item.name,
      totalQuantity: item.totalQuantity,
      unit: item.unit,
      minStockAlert: item.minStockAlert,
    })),
    earlyWarnings: earlyWarnings.slice(0, MAX_EARLY_WARNINGS),
  };
}

/** Lookup nearest production target HDP at or below the flock age. */
export async function lookupTargetHdp(
  strainId: number,
  ageInWeeks: number,
): Promise<number | null> {
  const target = await prisma.productionTarget.findFirst({
    where: {
      strain_id: strainId,
      age_in_weeks: { lte: ageInWeeks },
    },
    orderBy: { age_in_weeks: "desc" },
    select: { target_hdp: true },
  });

  return target?.target_hdp ?? null;
}

export { computeHdpPercent };
