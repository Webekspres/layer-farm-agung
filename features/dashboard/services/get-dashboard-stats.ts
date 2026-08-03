import { resolveActiveCyclePopulation } from "@/features/cages/services/resolve-active-cycle-population";
import { cycleAgeInWeeks } from "@/features/cages/lib/cycle-age-weeks";
import { computeHdpPercent } from "@/features/production/lib/compute-hdp";
import {
  buildCashWeekBalance,
  buildFcrSnapshot,
  buildMortalityWarnings,
  MORTALITY_WEEK_WARNING_THRESHOLD,
} from "@/features/dashboard/lib/dashboard-lite-metrics";
import {
  shiftBusinessDate,
  startOfTodayBusiness,
} from "@/lib/business-date";
import prisma from "@/lib/prisma";

/** Below this fraction of target HDP a cage is flagged as an early warning. */
const HDP_WARNING_THRESHOLD_RATIO = 0.9;
const MAX_EARLY_WARNINGS = 5;
const MAX_MORTALITY_WARNINGS = 5;

export type DashboardEarlyWarning = {
  cageId: string;
  cageName: string;
  actualHdp: number;
  targetHdp: number;
};

export type DashboardMortalityWarning = {
  cageId: string;
  cageName: string;
  deaths: number;
};

export type DashboardStats = {
  todayEggTotal: number;
  activePopulationTotal: number;
  lowStockItemCount: number;
  activeUserCount: number;
  /** FCR = kg pakan ÷ TB (hari ini). */
  fcrToday: number | null;
  /** FCR 7 hari kalender operasional (termasuk hari ini). */
  fcrLast7Days: number | null;
  weekSalesTotal: number;
  weekCashIncome: number;
  weekCashExpense: number;
  weekCashBalance: number;
  lowStockItems: {
    id: string;
    name: string;
    totalQuantity: number;
    unit: string;
    minStockAlert: number;
  }[];
  earlyWarnings: DashboardEarlyWarning[];
  mortalityWarnings: DashboardMortalityWarning[];
};

function decimalToNumber(value: { toNumber(): number } | number): number {
  return typeof value === "number" ? value : value.toNumber();
}

export async function getDashboardStats(
  tenantId: string,
  recordDate = startOfTodayBusiness(),
): Promise<DashboardStats> {
  const weekStart = shiftBusinessDate(recordDate, -6);

  const [
    prodAgg,
    cageProdGroups,
    items,
    activeCages,
    activeUserCount,
    feedToday,
    feedWeek,
    prodWeek,
    salesWeek,
    cashWeek,
    mortalityRows,
  ] = await Promise.all([
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
      where: { tenant_id: tenantId, type: { not: "Egg" } },
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
    prisma.feedConsumption.aggregate({
      where: { tenant_id: tenantId, record_date: recordDate },
      _sum: { quantity: true },
    }),
    prisma.feedConsumption.aggregate({
      where: {
        tenant_id: tenantId,
        record_date: { gte: weekStart, lte: recordDate },
      },
      _sum: { quantity: true },
    }),
    prisma.dailyProduction.aggregate({
      where: {
        tenant_id: tenantId,
        record_date: { gte: weekStart, lte: recordDate },
      },
      _sum: { tb: true },
    }),
    prisma.salesOrder.aggregate({
      where: {
        tenant_id: tenantId,
        sale_date: { gte: weekStart, lte: recordDate },
      },
      _sum: { total_amount: true },
    }),
    prisma.cashflowTransaction.groupBy({
      by: ["type"],
      where: {
        tenant_id: tenantId,
        transaction_date: { gte: weekStart, lte: recordDate },
      },
      _sum: { amount: true },
    }),
    prisma.populationMutation.groupBy({
      by: ["cage_id"],
      where: {
        mutation_type: "Mati",
        record_date: { gte: weekStart, lte: recordDate },
        cage: { location: { tenant_id: tenantId } },
      },
      _sum: { quantity: true },
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

  const cageNameById = new Map(activeCages.map((c) => [c.id, c.name]));
  // Include mortality for cages that may not be in active list (still show name from DB).
  const mortalityCageIds = mortalityRows.map((r) => r.cage_id);
  const missingCageIds = mortalityCageIds.filter((id) => !cageNameById.has(id));
  if (missingCageIds.length > 0) {
    const named = await prisma.cage.findMany({
      where: { id: { in: missingCageIds }, location: { tenant_id: tenantId } },
      select: { id: true, name: true },
    });
    for (const cage of named) {
      cageNameById.set(cage.id, cage.name);
    }
  }

  const mortalityWarnings = buildMortalityWarnings(
    mortalityRows.map((row) => ({
      cageId: row.cage_id,
      cageName: cageNameById.get(row.cage_id) ?? "Kandang",
      deaths: row._sum.quantity ?? 0,
    })),
    MORTALITY_WEEK_WARNING_THRESHOLD,
  ).slice(0, MAX_MORTALITY_WARNINGS);

  const todayTb = prodAgg._sum.tb ?? 0;
  const weekTb = prodWeek._sum.tb ?? 0;
  const feedTodayKg = feedToday._sum.quantity ?? 0;
  const feedWeekKg = feedWeek._sum.quantity ?? 0;

  let weekCashIncome = 0;
  let weekCashExpense = 0;
  for (const row of cashWeek) {
    const amount = decimalToNumber(row._sum.amount ?? 0);
    if (row.type === "Income") weekCashIncome = amount;
    if (row.type === "Expense") weekCashExpense = amount;
  }

  const weekSalesTotal = decimalToNumber(salesWeek._sum.total_amount ?? 0);

  return {
    todayEggTotal: todayTb,
    activePopulationTotal,
    lowStockItemCount: lowStockAll.length,
    activeUserCount,
    fcrToday: buildFcrSnapshot(feedTodayKg, todayTb),
    fcrLast7Days: buildFcrSnapshot(feedWeekKg, weekTb),
    weekSalesTotal,
    weekCashIncome,
    weekCashExpense,
    weekCashBalance: buildCashWeekBalance(weekCashIncome, weekCashExpense),
    lowStockItems: lowStockItems.map((item) => ({
      id: item.id,
      name: item.name,
      totalQuantity: item.totalQuantity,
      unit: item.unit,
      minStockAlert: item.minStockAlert,
    })),
    earlyWarnings: earlyWarnings.slice(0, MAX_EARLY_WARNINGS),
    mortalityWarnings,
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
