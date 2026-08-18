import { resolveActiveCyclePopulation } from "@/features/cages/services/resolve-active-cycle-population";
import { cycleAgeInWeeks } from "@/features/cages/lib/cycle-age-weeks";
import { computeHdpPercent } from "@/features/production/lib/compute-hdp";
import { sumEggMassKgInPeriod } from "@/features/cages/lib/cycle-operational-metrics";
import {
  buildCashWeekBalance,
  buildFcrSnapshot,
  buildMortalityWarnings,
  MORTALITY_WEEK_WARNING_THRESHOLD,
} from "@/features/dashboard/lib/dashboard-lite-metrics";
import type { DashboardExecutive } from "@/features/dashboard/lib/dashboard-executive-types";
import {
  buildKpi,
  enumerateBusinessDates,
  fillSeries,
  shortDateLabel,
  toDateKeyMap,
} from "@/features/dashboard/lib/dashboard-series";

const GRADE_FILLS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
] as const;
import {
  formatBusinessDate,
  shiftBusinessDate,
  startOfTodayBusiness,
} from "@/lib/business-date";
import prisma from "@/lib/prisma";
import { lookupTargetHdp } from "@/features/dashboard/services/get-dashboard-stats";
import { syncDashboardAlerts } from "@/features/dashboard/services/sync-dashboard-alerts";

const HDP_WARNING_THRESHOLD_RATIO = 0.9;
const MAX_EARLY_WARNINGS = 5;
const MAX_MORTALITY_WARNINGS = 5;
const MAX_TIMELINE = 10;
const MAX_FEED_CAGES = 8;

function decimalToNumber(value: { toNumber(): number } | number): number {
  return typeof value === "number" ? value : value.toNumber();
}

function sparkFromSeries(values: number[], take = 7): number[] {
  if (values.length === 0) return [];
  return values.slice(-take);
}

export async function getDashboardExecutive(
  tenantId: string,
  recordDate = startOfTodayBusiness(),
  /** When set, all cage-scoped KPIs/series use only these cages (auth already resolved). */
  cageIds?: string[],
): Promise<DashboardExecutive> {
  const yesterday = shiftBusinessDate(recordDate, -1);
  const weekStart = shiftBusinessDate(recordDate, -6);
  const range30Start = shiftBusinessDate(recordDate, -29);
  const dates30 = enumerateBusinessDates(recordDate, 30);
  const dates7 = enumerateBusinessDates(recordDate, 7);

  const scoped = cageIds !== undefined;
  const cageIdFilter = scoped ? { cage_id: { in: cageIds } } : {};
  const emptyScope = scoped && cageIds.length === 0;

  const [
    prodToday,
    prodYesterday,
    cageProdToday,
    items,
    activeCages,
    feedToday,
    feedYesterday,
    feedWeek,
    prodWeek,
    salesToday,
    salesYesterday,
    salesWeek,
    cashWeek,
    mortalityWeekRows,
    prodByDate,
    feedByCage,
    mortalityByDate,
    salesByDate,
    cashByDate,
    gradeRows,
    recentProduction,
    recentVaccines,
    recentPurchaseOrders,
    recentStockMutations,
  ] = await Promise.all([
    emptyScope
      ? Promise.resolve([])
      : prisma.dailyProduction.findMany({
          where: {
            tenant_id: tenantId,
            record_date: recordDate,
            ...cageIdFilter,
          },
          select: {
            record_date: true,
            tb: true,
            tr: true,
            tp: true,
            weight: true,
          },
        }),
    emptyScope
      ? Promise.resolve([])
      : prisma.dailyProduction.findMany({
          where: {
            tenant_id: tenantId,
            record_date: yesterday,
            ...cageIdFilter,
          },
          select: {
            record_date: true,
            tb: true,
            tr: true,
            tp: true,
            weight: true,
          },
        }),
    emptyScope
      ? Promise.resolve([])
      : prisma.dailyProduction.groupBy({
          by: ["cage_id"],
          where: {
            tenant_id: tenantId,
            record_date: recordDate,
            ...cageIdFilter,
          },
          _sum: { tb: true, tr: true, tp: true },
        }),
    prisma.item.findMany({
      where: { tenant_id: tenantId, type: { not: "Egg" } },
      select: {
        id: true,
        name: true,
        type: true,
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
        ...(scoped ? { id: { in: cageIds } } : {}),
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
    emptyScope
      ? Promise.resolve({ _sum: { quantity: null } })
      : prisma.feedConsumption.aggregate({
          where: {
            tenant_id: tenantId,
            record_date: recordDate,
            ...cageIdFilter,
          },
          _sum: { quantity: true },
        }),
    emptyScope
      ? Promise.resolve({ _sum: { quantity: null } })
      : prisma.feedConsumption.aggregate({
          where: {
            tenant_id: tenantId,
            record_date: yesterday,
            ...cageIdFilter,
          },
          _sum: { quantity: true },
        }),
    emptyScope
      ? Promise.resolve({ _sum: { quantity: null } })
      : prisma.feedConsumption.aggregate({
          where: {
            tenant_id: tenantId,
            record_date: { gte: weekStart, lte: recordDate },
            ...cageIdFilter,
          },
          _sum: { quantity: true },
        }),
    emptyScope
      ? Promise.resolve([])
      : prisma.dailyProduction.findMany({
          where: {
            tenant_id: tenantId,
            record_date: { gte: weekStart, lte: recordDate },
            ...cageIdFilter,
          },
          select: {
            record_date: true,
            tb: true,
            tr: true,
            tp: true,
            weight: true,
          },
        }),
    prisma.salesOrder.aggregate({
      where: { tenant_id: tenantId, sale_date: recordDate },
      _sum: { total_amount: true },
    }),
    prisma.salesOrder.aggregate({
      where: { tenant_id: tenantId, sale_date: yesterday },
      _sum: { total_amount: true },
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
    emptyScope
      ? Promise.resolve([])
      : prisma.populationMutation.groupBy({
          by: ["cage_id"],
          where: {
            mutation_type: "Mati",
            record_date: { gte: weekStart, lte: recordDate },
            cage: { location: { tenant_id: tenantId } },
            ...cageIdFilter,
          },
          _sum: { quantity: true },
        }),
    emptyScope
      ? Promise.resolve([])
      : prisma.dailyProduction.groupBy({
          by: ["record_date"],
          where: {
            tenant_id: tenantId,
            record_date: { gte: range30Start, lte: recordDate },
            ...cageIdFilter,
          },
          _sum: { tb: true, tr: true, tp: true },
          orderBy: { record_date: "asc" },
        }),
    emptyScope
      ? Promise.resolve([])
      : prisma.feedConsumption.groupBy({
          by: ["cage_id"],
          where: {
            tenant_id: tenantId,
            record_date: { gte: weekStart, lte: recordDate },
            ...cageIdFilter,
          },
          _sum: { quantity: true },
          orderBy: { _sum: { quantity: "desc" } },
          take: MAX_FEED_CAGES,
        }),
    emptyScope
      ? Promise.resolve([])
      : prisma.populationMutation.groupBy({
          by: ["record_date"],
          where: {
            mutation_type: "Mati",
            record_date: { gte: range30Start, lte: recordDate },
            cage: { location: { tenant_id: tenantId } },
            ...(scoped ? { cage_id: { in: cageIds } } : {}),
          },
          _sum: { quantity: true },
          orderBy: { record_date: "asc" },
        }),
    prisma.salesOrder.groupBy({
      by: ["sale_date"],
      where: {
        tenant_id: tenantId,
        sale_date: { gte: weekStart, lte: recordDate },
      },
      _sum: { total_amount: true },
      orderBy: { sale_date: "asc" },
    }),
    prisma.cashflowTransaction.groupBy({
      by: ["transaction_date", "type"],
      where: {
        tenant_id: tenantId,
        transaction_date: { gte: weekStart, lte: recordDate },
      },
      _sum: { amount: true },
      orderBy: { transaction_date: "asc" },
    }),
    prisma.salesOrderItem.groupBy({
      by: ["egg_grade_id"],
      where: {
        sales_order: {
          tenant_id: tenantId,
          sale_date: { gte: range30Start, lte: recordDate },
        },
        egg_grade_id: { not: null },
      },
      _sum: { quantity: true },
    }),
    emptyScope
      ? Promise.resolve([])
      : prisma.dailyProduction.findMany({
          where: { tenant_id: tenantId, ...cageIdFilter },
          orderBy: [{ record_date: "desc" }, { created_at: "desc" }],
          take: 4,
          select: {
            id: true,
            record_date: true,
            created_at: true,
            tb: true,
            tr: true,
            tp: true,
            cage: { select: { name: true } },
          },
        }),
    emptyScope
      ? Promise.resolve([])
      : prisma.vaccineSchedule.findMany({
          where: {
            status: "Completed",
            cage: { location: { tenant_id: tenantId } },
            ...(scoped ? { cage_id: { in: cageIds } } : {}),
          },
          orderBy: [{ completed_at: "desc" }, { scheduled_date: "desc" }],
          take: 4,
          select: {
            id: true,
            scheduled_date: true,
            completed_at: true,
            quantity_used: true,
            cage: { select: { name: true } },
            item: { select: { name: true } },
          },
        }),
    prisma.purchaseOrder.findMany({
      where: {
        vendor: { tenant_id: tenantId },
        status: { in: ["Received", "PartiallyReceived"] },
      },
      orderBy: [{ order_date: "desc" }, { created_at: "desc" }],
      take: 4,
      select: {
        id: true,
        order_date: true,
        created_at: true,
        status: true,
        total_amount: true,
        vendor: { select: { name: true } },
      },
    }),
    prisma.stockMutation.findMany({
      where: { item: { tenant_id: tenantId, type: { not: "Egg" } } },
      orderBy: { mutation_date: "desc" },
      take: 4,
      select: {
        id: true,
        mutation_type: true,
        quantity: true,
        mutation_date: true,
        item: { select: { name: true, unit: true } },
      },
    }),
  ]);

  const cageEggsById = new Map(
    cageProdToday.map((row) => [
      row.cage_id,
      (row._sum.tb ?? 0) + (row._sum.tr ?? 0) + (row._sum.tp ?? 0),
    ]),
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

  const earlyWarnings: DashboardExecutive["earlyWarnings"] = [];
  let targetHdpSum = 0;
  let targetHdpCount = 0;

  for (let i = 0; i < activeCages.length; i++) {
    const cage = activeCages[i]!;
    const activeCycle = cage.cycle_settings[0];
    if (!activeCycle) continue;

    const population = cagePopulations[i];
    const eggs = cageEggsById.get(cage.id) ?? 0;
    const actualHdp = computeHdpPercent(eggs, population ?? 0);
    if (actualHdp === null) continue;

    const ageWeeks = cycleAgeInWeeks(activeCycle.start_date, recordDate);
    const targetHdp = await lookupTargetHdp(cage.strain_id, ageWeeks);
    if (targetHdp === null) continue;

    targetHdpSum += targetHdp;
    targetHdpCount += 1;

    if (actualHdp < targetHdp * HDP_WARNING_THRESHOLD_RATIO) {
      earlyWarnings.push({
        cageId: cage.id,
        cageName: cage.name,
        actualHdp,
        targetHdp,
      });
    }
  }

  const avgTargetHdp =
    targetHdpCount > 0 ? targetHdpSum / targetHdpCount : 90;

  const lowStockAll = items
    .map((item) => {
      const totalQuantity = item.inventory_stocks.reduce(
        (sum, stock) => sum + stock.quantity,
        0,
      );
      return {
        id: item.id,
        name: item.name,
        type: item.type,
        totalQuantity,
        unit: item.unit,
        minStockAlert: item.min_stock_alert ?? 0,
      };
    })
    .filter(
      (item) =>
        item.minStockAlert > 0 && item.totalQuantity <= item.minStockAlert,
    );

  const cageNameById = new Map(activeCages.map((c) => [c.id, c.name]));
  const mortalityCageIds = mortalityWeekRows.map((r) => r.cage_id);
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

  const feedCageIds = feedByCage.map((r) => r.cage_id);
  const missingFeedNames = feedCageIds.filter((id) => !cageNameById.has(id));
  if (missingFeedNames.length > 0) {
    const named = await prisma.cage.findMany({
      where: { id: { in: missingFeedNames }, location: { tenant_id: tenantId } },
      select: { id: true, name: true },
    });
    for (const cage of named) {
      cageNameById.set(cage.id, cage.name);
    }
  }

  const mortalityWarnings = buildMortalityWarnings(
    mortalityWeekRows.map((row) => ({
      cageId: row.cage_id,
      cageName: cageNameById.get(row.cage_id) ?? "Kandang",
      deaths: row._sum.quantity ?? 0,
    })),
    MORTALITY_WEEK_WARNING_THRESHOLD,
  ).slice(0, MAX_MORTALITY_WARNINGS);
  const lowStockAlerts = lowStockAll.slice(0, 6).map((item) => ({
    id: item.id,
    name: item.name,
    totalQuantity: item.totalQuantity,
    unit: item.unit,
    minStockAlert: item.minStockAlert,
  }));

  await syncDashboardAlerts({
    tenantId,
    recordDate,
    hdpWarnings: earlyWarnings,
    mortalityWarnings,
    lowStockAlerts,
  });

  const persistentAlerts = await prisma.alertLog.findMany({
    where: { tenant_id: tenantId },
    orderBy: [{ is_read: "asc" }, { created_at: "desc" }],
    take: 8,
    select: {
      id: true,
      type: true,
      severity: true,
      title: true,
      message: true,
      source: true,
      source_id: true,
      is_read: true,
      created_at: true,
      resolved_at: true,
    },
  });

  const todayTotal = prodToday.reduce(
    (sum, row) => sum + row.tb + row.tr + row.tp,
    0,
  );
  const yesterdayTotal = prodYesterday.reduce(
    (sum, row) => sum + row.tb + row.tr + row.tp,
    0,
  );
  const todayEggMassKg = sumEggMassKgInPeriod(prodToday, recordDate, recordDate);
  const yesterdayEggMassKg = sumEggMassKgInPeriod(
    prodYesterday,
    yesterday,
    yesterday,
  );
  const weekEggMassKg = sumEggMassKgInPeriod(prodWeek, weekStart, recordDate);
  const feedTodayKg = feedToday._sum.quantity ?? 0;
  const feedYesterdayKg = feedYesterday._sum.quantity ?? 0;
  const feedWeekKg = feedWeek._sum.quantity ?? 0;

  const fcrToday = buildFcrSnapshot(feedTodayKg, todayEggMassKg);
  const fcrYesterday = buildFcrSnapshot(feedYesterdayKg, yesterdayEggMassKg);
  const fcrWeek = buildFcrSnapshot(feedWeekKg, weekEggMassKg);

  const hdpToday = computeHdpPercent(todayTotal, activePopulationTotal);
  const hdpYesterday = computeHdpPercent(yesterdayTotal, activePopulationTotal);

  const revenueToday = decimalToNumber(salesToday._sum.total_amount ?? 0);
  const revenueYesterday = decimalToNumber(
    salesYesterday._sum.total_amount ?? 0,
  );
  const weekSalesTotal = decimalToNumber(salesWeek._sum.total_amount ?? 0);

  let weekCashIncome = 0;
  let weekCashExpense = 0;
  for (const row of cashWeek) {
    const amount = decimalToNumber(row._sum.amount ?? 0);
    if (row.type === "Income") weekCashIncome = amount;
    if (row.type === "Expense") weekCashExpense = amount;
  }
  const weeklyProfit = buildCashWeekBalance(weekCashIncome, weekCashExpense);

  // --- Series: production 30d (total seluruh kategori; zeros = no record that day) ---
  const prodKeyed = toDateKeyMap(
    prodByDate.map((row) => ({
      date: row.record_date,
      value:
        (row._sum.tb ?? 0) + (row._sum.tr ?? 0) + (row._sum.tp ?? 0),
    })),
  );
  const production30d = fillSeries(dates30, prodKeyed).map((p) => ({
    date: p.date,
    label: p.label,
    eggs: p.value,
  }));

  // --- HDP vs target (daily total telur / current active population) ---
  const hdpVsTarget30d = production30d.map((point) => {
    const hdp =
      activePopulationTotal > 0
        ? Number(((point.eggs / activePopulationTotal) * 100).toFixed(1))
        : 0;
    return {
      date: point.date,
      label: point.label,
      hdp,
      target: Number(avgTargetHdp.toFixed(1)),
    };
  });

  // --- Egg grade donut (sales labels, 30 hari) ---
  const gradeIds = gradeRows
    .map((r) => r.egg_grade_id)
    .filter((id): id is number => id != null);
  let eggGradeDistribution: DashboardExecutive["eggGradeDistribution"] = [];
  if (gradeIds.length > 0) {
    const grades = await prisma.eggGrade.findMany({
      where: { id: { in: gradeIds } },
      select: { id: true, name: true },
    });
    const nameById = new Map(grades.map((g) => [g.id, g.name]));
    eggGradeDistribution = gradeRows
      .filter((r) => r.egg_grade_id != null)
      .map((r, index) => ({
        grade: nameById.get(r.egg_grade_id!) ?? `Grade ${r.egg_grade_id}`,
        value: r._sum.quantity ?? 0,
        fill: GRADE_FILLS[index % GRADE_FILLS.length]!,
      }))
      .filter((r) => r.value > 0);
  }

  // --- Feed per cage ---
  const feedPerCage = feedByCage
    .map((row) => ({
      cage: cageNameById.get(row.cage_id) ?? "Kandang",
      kg: Number((row._sum.quantity ?? 0).toFixed(1)),
    }))
    .filter((row) => row.kg > 0);

  // --- Mortality trend ---
  const mortKeyed = toDateKeyMap(
    mortalityByDate.map((row) => ({
      date: row.record_date,
      value: row._sum.quantity ?? 0,
    })),
  );
  const mortalityTrend = fillSeries(dates30, mortKeyed).map((p) => ({
    date: p.date,
    label: p.label,
    deaths: p.value,
  }));

  // --- Sales 7d ---
  const salesKeyed = toDateKeyMap(
    salesByDate.map((row) => ({
      date: row.sale_date,
      value: decimalToNumber(row._sum.total_amount ?? 0),
    })),
  );
  const sales7d = fillSeries(dates7, salesKeyed).map((p) => ({
    date: p.date,
    label: p.label,
    amount: p.value,
  }));

  // --- Cashflow 7d ---
  const incomeMap = new Map<string, number>();
  const expenseMap = new Map<string, number>();
  for (const row of cashByDate) {
    const key = formatBusinessDate(row.transaction_date);
    const amount = decimalToNumber(row._sum.amount ?? 0);
    if (row.type === "Income") {
      incomeMap.set(key, (incomeMap.get(key) ?? 0) + amount);
    } else if (row.type === "Expense") {
      expenseMap.set(key, (expenseMap.get(key) ?? 0) + amount);
    }
  }
  const cashflow7d = dates7.map((date) => {
    const key = formatBusinessDate(date);
    return {
      date: key,
      label: shortDateLabel(date),
      income: incomeMap.get(key) ?? 0,
      expense: expenseMap.get(key) ?? 0,
    };
  });

  // --- Inventory buckets ---
  const bucketTypes = [
    { type: "Feed" as const, label: "Pakan", unit: "kg" },
    { type: "Medicine" as const, label: "Obat", unit: "unit" },
    { type: "Vaccine" as const, label: "Vaksin", unit: "unit" },
  ];
  const inventory = bucketTypes.map((bucket) => {
    const matched = items.filter((item) => item.type === bucket.type);
    const quantity = matched.reduce(
      (sum, item) =>
        sum +
        item.inventory_stocks.reduce((s, stock) => s + stock.quantity, 0),
      0,
    );
    const unit =
      matched.find((item) => item.unit)?.unit ?? bucket.unit;
    return {
      type: bucket.type,
      label: bucket.label,
      quantity,
      unit,
      itemCount: matched.length,
    };
  });

  // --- Timeline ---
  type TimelineDraft = DashboardExecutive["timeline"][number];
  const timelineDraft: TimelineDraft[] = [];

  for (const row of recentProduction) {
    timelineDraft.push({
      id: `prod-${row.id}`,
      kind: "production",
      title: "Produksi harian",
      description: `${row.cage.name}: ${(
        row.tb + row.tr + row.tp
      ).toLocaleString("id-ID")} butir telur`,
      at: row.created_at.toISOString(),
      href: "/dashboard/production",
    });
  }
  for (const row of recentVaccines) {
    timelineDraft.push({
      id: `vax-${row.id}`,
      kind: "vaccination",
      title: "Vaksinasi selesai",
      description: `${row.item.name} — ${row.cage.name}${
        row.quantity_used != null
          ? ` (${row.quantity_used.toLocaleString("id-ID")} unit)`
          : ""
      }`,
      at: (row.completed_at ?? row.scheduled_date).toISOString(),
      href: "/dashboard/health/vaccines",
    });
  }
  for (const row of recentPurchaseOrders) {
    timelineDraft.push({
      id: `po-${row.id}`,
      kind: "purchase_order",
      title:
        row.status === "PartiallyReceived"
          ? "PO sebagian diterima"
          : "PO diterima",
      description: `${row.vendor.name} — ${decimalToNumber(row.total_amount).toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })}`,
      at: row.created_at.toISOString(),
      href: `/dashboard/purchase-orders/${row.id}`,
    });
  }
  for (const row of recentStockMutations) {
    timelineDraft.push({
      id: `stock-${row.id}`,
      kind: "stock_adjustment",
      title: "Mutasi stok",
      description: `${row.mutation_type}: ${row.item.name} (${row.quantity.toLocaleString("id-ID")} ${row.item.unit})`,
      at: row.mutation_date.toISOString(),
      href: "/dashboard/inventory/mutations",
    });
  }

  timelineDraft.sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );
  const timeline = timelineDraft.slice(0, MAX_TIMELINE);

  const eggSpark = sparkFromSeries(production30d.map((p) => p.eggs));
  const hdpSpark = sparkFromSeries(hdpVsTarget30d.map((p) => p.hdp));
  const salesSpark = sparkFromSeries(sales7d.map((p) => p.amount));
  const fcrSpark =
    fcrToday != null ? [fcrYesterday ?? fcrToday, fcrToday] : [];

  const kpis = [
    buildKpi({
      id: "eggs",
      label: "Produksi telur hari ini",
      value: todayTotal,
      previous: yesterdayTotal,
      format: "count",
      unit: "butir",
      comparisonLabel: "vs kemarin",
      sparkline: eggSpark,
    }),
    buildKpi({
      id: "population",
      label: "Populasi aktif",
      value: activePopulationTotal,
      previous: activePopulationTotal,
      format: "integer",
      unit: "ekor",
      comparisonLabel: "siklus aktif",
      sparkline: [activePopulationTotal],
    }),
    buildKpi({
      id: "hdp",
      label: "HDP hari ini (indikatif)",
      value: hdpToday,
      previous: hdpYesterday,
      format: "percent",
      unit: "%",
      comparisonLabel: "vs kemarin — bukan angka keputusan",
      sparkline: hdpSpark,
    }),
    buildKpi({
      id: "fcr",
      label: "FCR hari ini (egg mass, indikatif)",
      value: fcrToday,
      previous: fcrYesterday ?? fcrWeek,
      format: "fcr",
      unit: "kg/kg",
      comparisonLabel: "vs kemarin — tersembunyi bila berat kosong",
      sparkline: fcrSpark,
      invertTrend: true,
    }),
    buildKpi({
      id: "critical-stock",
      label: "Stok kritis",
      value: lowStockAll.length,
      previous: lowStockAll.length,
      format: "integer",
      unit: "item",
      comparisonLabel: "saprodi di bawah ambang",
      sparkline: [lowStockAll.length],
      invertTrend: true,
    }),
    buildKpi({
      id: "revenue",
      label: "Pendapatan hari ini",
      value: revenueToday,
      previous: revenueYesterday,
      format: "currency",
      comparisonLabel: "vs kemarin",
      sparkline: salesSpark,
    }),
  ];

  return {
    recordDate: formatBusinessDate(recordDate),
    kpis,
    production30d,
    hdpVsTarget30d,
    eggGradeDistribution,
    feedPerCage,
    mortalityTrend,
    sales7d,
    cashflow7d,
    weeklyProfit,
    weekSalesTotal,
    inventory,
    lowStockAlerts,
    timeline,
    earlyWarnings: earlyWarnings.slice(0, MAX_EARLY_WARNINGS),
    mortalityWarnings,
    persistentAlerts: persistentAlerts.map((alert) => ({
      id: alert.id,
      type: alert.type,
      severity: alert.severity,
      title: alert.title,
      message: alert.message,
      source: alert.source,
      sourceId: alert.source_id,
      isRead: alert.is_read,
      createdAt: alert.created_at.toISOString(),
      resolvedAt: alert.resolved_at?.toISOString() ?? null,
    })),
  };
}
