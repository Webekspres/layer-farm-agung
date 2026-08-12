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
        select: { start_date: true },
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
      _sum: { tb: true },
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

  const tbByDate = toDateKeyMap(
    weekAgg.map((row) => ({
      date: row.record_date,
      value: row._sum.tb ?? 0,
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
    tbByDate,
  });
}

export type { FieldOverview };
