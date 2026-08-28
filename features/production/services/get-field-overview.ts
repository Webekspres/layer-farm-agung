import { getAssignedCageIdsForUser } from "@/features/cages/lib/cage-staff-db";
import { cycleAgeInWeeks } from "@/features/cages/lib/cycle-age-weeks";
import { resolveActiveCyclePopulation } from "@/features/cages/services/resolve-active-cycle-population";
import {
  DashboardScopeError,
  resolveDashboardCageScope,
} from "@/features/dashboard/lib/resolve-dashboard-cage-scope";
import { lookupTargetHdp } from "@/features/dashboard/services/get-dashboard-stats";
import { STAFF_ROLE_NAME } from "@/features/roles/config/system-roles";
import {
  buildFieldOverview,
  emptyFieldOverview,
  toDateKeyMap,
  type FieldOverview,
} from "@/features/production/lib/field-overview";
import {
  formatBusinessDate,
  normalizeBusinessDate,
  shiftBusinessDate,
  startOfTodayBusiness,
} from "@/lib/business-date";
import prisma from "@/lib/prisma";

type OverviewDeps = {
  prisma: typeof prisma;
  getAssignedCageIdsForUser: typeof getAssignedCageIdsForUser;
  resolveActiveCyclePopulation: typeof resolveActiveCyclePopulation;
  lookupTargetHdp: typeof lookupTargetHdp;
  resolveDashboardCageScope: typeof resolveDashboardCageScope;
};

const defaultDeps: OverviewDeps = {
  prisma,
  getAssignedCageIdsForUser,
  resolveActiveCyclePopulation,
  lookupTargetHdp,
  resolveDashboardCageScope,
};

export { DashboardScopeError };

/**
 * Staff-scoped operational overview for assigned cages only.
 * Optional `cageId` narrows to one authorized cage.
 * Does not include sales, cashflow, or tenant-wide inventory.
 */
export async function getFieldOverview(
  tenantId: string,
  userId: string,
  options: { cageId?: string | null } = {},
  deps: OverviewDeps = defaultDeps,
): Promise<FieldOverview> {
  const recordDate = startOfTodayBusiness();
  const scope = await deps.resolveDashboardCageScope(
    {
      tenantId,
      userId,
      roleName: STAFF_ROLE_NAME,
      requested: options.cageId
        ? { kind: "cage", cageId: options.cageId }
        : { kind: "all" },
    },
    {
      prisma: deps.prisma,
      getAssignedCageIdsForUser: deps.getAssignedCageIdsForUser,
    },
  );

  if (scope.cageIds.length === 0) {
    return emptyFieldOverview(recordDate);
  }

  const cages = await deps.prisma.cage.findMany({
    where: {
      status: "Active",
      location: { tenant_id: tenantId },
      id: { in: scope.cageIds },
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
        select: {
          id: true,
          start_date: true,
          go_live_date: true,
          end_date: true,
        },
      },
      daily_productions: {
        where: {
          tenant_id: tenantId,
          record_date: recordDate,
        },
        take: 1,
        select: { id: true },
      },
    },
    orderBy: { name: "asc" },
  });

  if (cages.length === 0) {
    return emptyFieldOverview(recordDate);
  }

  const cageIds = cages.map((c) => c.id);
  const weekStart = shiftBusinessDate(recordDate, -6);

  const [populations, todayAgg, weekAgg, vaccineRows] = await Promise.all([
    Promise.all(
      cages.map((cage) =>
        cage.cycle_settings[0]
          ? deps.resolveActiveCyclePopulation(cage.id, recordDate)
          : Promise.resolve(null),
      ),
    ),
    deps.prisma.dailyProduction.aggregate({
      where: {
        tenant_id: tenantId,
        cage_id: { in: cageIds },
        record_date: recordDate,
      },
      _sum: { tb: true, tr: true, tp: true },
    }),
    deps.prisma.dailyProduction.groupBy({
      by: ["record_date"],
      where: {
        tenant_id: tenantId,
        cage_id: { in: cageIds },
        record_date: { gte: weekStart, lte: recordDate },
      },
      _sum: { tb: true, tr: true, tp: true },
    }),
    deps.prisma.vaccineSchedule.findMany({
      where: {
        cage_id: { in: cageIds },
        status: "Pending",
      },
      select: { scheduled_date: true },
    }),
  ]);

  const todayStr = formatBusinessDate(recordDate);
  let pendingVaccineCount = 0;
  let overdueVaccineCount = 0;
  for (const row of vaccineRows) {
    pendingVaccineCount += 1;
    if (formatBusinessDate(row.scheduled_date) < todayStr) {
      overdueVaccineCount += 1;
    }
  }

  // FCR siklus aktif (kg pakan ÷ egg mass kg) untuk lingkup kandang terpilih.
  const activeCycles = cages
    .map((cage) => ({
      cageId: cage.id,
      cycle: cage.cycle_settings[0],
    }))
    .filter(
      (
        entry,
      ): entry is {
        cageId: string;
        cycle: {
          id: string;
          start_date: Date;
          go_live_date: Date | null;
          end_date: Date | null;
        };
      } => entry.cycle != null,
    );

  let cycleFeedKg = 0;
  let cycleEggMassKg = 0;
  let cycleFcrBlocked = false;

  if (activeCycles.length > 0) {
    const minEffectiveStart = activeCycles.reduce<number | null>(
      (min, entry) => {
        const eff = normalizeBusinessDate(
          entry.cycle.go_live_date ?? entry.cycle.start_date,
        ).getTime();
        return min === null || eff < min ? eff : min;
      },
      null,
    );

    const [cycleFeedRows, cycleProductionRows] = await Promise.all([
      deps.prisma.feedConsumption.findMany({
        where: {
          tenant_id: tenantId,
          cage_id: { in: cageIds },
          record_date: { gte: new Date(minEffectiveStart!) },
        },
        select: { cage_id: true, record_date: true, quantity: true },
      }),
      deps.prisma.dailyProduction.findMany({
        where: {
          tenant_id: tenantId,
          cage_id: { in: cageIds },
          record_date: { gte: new Date(minEffectiveStart!) },
        },
        select: {
          cage_id: true,
          record_date: true,
          tb: true,
          tr: true,
          tp: true,
          weight: true,
        },
      }),
    ]);

    const periodEndMs = normalizeBusinessDate(recordDate).getTime();

    for (const entry of activeCycles) {
      const startMs = normalizeBusinessDate(
        entry.cycle.go_live_date ?? entry.cycle.start_date,
      ).getTime();
      const endMs = entry.cycle.end_date
        ? normalizeBusinessDate(entry.cycle.end_date).getTime()
        : periodEndMs;

      for (const row of cycleFeedRows) {
        const ts = normalizeBusinessDate(row.record_date).getTime();
        if (row.cage_id === entry.cageId && ts >= startMs && ts <= endMs) {
          cycleFeedKg += row.quantity;
        }
      }

      for (const row of cycleProductionRows) {
        if (row.cage_id !== entry.cageId) continue;
        const ts = normalizeBusinessDate(row.record_date).getTime();
        if (ts < startMs || ts > endMs) continue;
        if (!row.weight || row.weight <= 0) {
          const totalEggs = row.tb + row.tr + row.tp;
          if (totalEggs > 0) cycleFcrBlocked = true;
          continue;
        }
        const totalEggs = row.tb + row.tr + row.tp;
        cycleEggMassKg += (totalEggs * row.weight) / 1000;
      }
    }
  }

  const cageInputs = await Promise.all(
    cages.map(async (cage, index) => {
      const activeCycle = cage.cycle_settings[0];
      const population = populations[index] ?? 0;
      let targetHdp: number | null = null;
      if (activeCycle) {
        const ageWeeks = cycleAgeInWeeks(activeCycle.start_date, recordDate);
        targetHdp = await deps.lookupTargetHdp(cage.strain_id, ageWeeks);
      }
      return {
        id: cage.id,
        name: cage.name,
        population,
        recordedToday: cage.daily_productions.length > 0,
        targetHdp,
      };
    }),
  );

  const eggsByDate = toDateKeyMap(
    weekAgg.map((row) => ({
      date: row.record_date,
      value:
        (row._sum.tb ?? 0) + (row._sum.tr ?? 0) + (row._sum.tp ?? 0),
    })),
  );

  return buildFieldOverview({
    recordDate,
    cages: cageInputs,
    todayTb: todayAgg._sum.tb ?? 0,
    todayTr: todayAgg._sum.tr ?? 0,
    todayTp: todayAgg._sum.tp ?? 0,
    pendingVaccineCount,
    overdueVaccineCount,
    cycleFeedKg,
    cycleEggMassKg,
    cycleFcrBlocked,
    eggsByDate,
  });
}

export type { FieldOverview };
