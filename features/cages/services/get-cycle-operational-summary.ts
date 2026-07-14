import { lookupTargetHdp } from "@/features/dashboard/services/get-dashboard-stats";
import {
  aggregateMutationTotals,
  computeAverageHdpForPeriod,
  computeCapacityPercent,
  computeCrackRatio,
  computeCycleAgeParts,
  computeFcr,
  filterMedicalInPeriod,
  sumProductionInPeriod,
  sumProductionOnDate,
  type DailyProductionLike,
  type PopulationMutationLike,
} from "@/features/cages/lib/cycle-operational-metrics";
import { computeCyclePopulation } from "@/features/cages/lib/compute-cycle-population";
import { computeHdpPercent } from "@/features/production/lib/compute-hdp";
import { normalizeBusinessDate, startOfTodayBusiness } from "@/lib/business-date";
import prisma from "@/lib/prisma";

export type CycleOperationalSummary = {
  cycleId: string;
  startDate: Date;
  endDate: Date | null;
  initialPopulation: number;
  currentPopulation: number;
  ageWeeks: number;
  ageDaysRemainder: number;
  capacityPercent: number | null;
  mutations: {
    masuk: number;
    mati: number;
    afkir: number;
    pindah: number;
  };
  production: {
    todayTb: number;
    todayTr: number;
    todayTp: number;
    todayHdp: number | null;
    targetHdp: number | null;
    averageHdp: number | null;
    cumulativeTb: number;
    cumulativeTr: number;
    cumulativeTp: number;
    crackRatio: number | null;
  };
  feed: {
    totalQuantity: number;
    fcr: number | null;
  };
  medical: {
    eventCount: number;
    mortalityTotal: number;
    sickPopulationMax: number;
  };
};

export type CycleRowInput = {
  id: string;
  start_date: Date;
  end_date: Date | null;
  initial_population: number;
  status: string;
};

export type CageCycleRawData = {
  mutations: PopulationMutationLike[];
  production: DailyProductionLike[];
  feed: { record_date: Date; quantity: number }[];
  medical: {
    treatment_date: Date;
    mortality_count: number;
    sick_population: number;
  }[];
};

export function buildCycleOperationalSummary(
  cycle: CycleRowInput,
  strainId: number,
  capacity: number,
  raw: CageCycleRawData,
  asOfDate = startOfTodayBusiness(),
  targetHdp: number | null = null,
): CycleOperationalSummary {
  const periodEnd =
    cycle.end_date !== null
      ? normalizeBusinessDate(cycle.end_date)
      : normalizeBusinessDate(asOfDate);

  const currentPopulation = computeCyclePopulation(
    cycle.initial_population,
    raw.mutations,
    periodEnd,
  );

  const mutationTotals = aggregateMutationTotals(
    raw.mutations,
    cycle.start_date,
    periodEnd,
  );

  const cumulative = sumProductionInPeriod(
    raw.production,
    cycle.start_date,
    periodEnd,
  );

  const isActive = cycle.status === "Active" && cycle.end_date === null;
  const todayProduction = isActive
    ? sumProductionOnDate(raw.production, asOfDate)
    : { tb: 0, tr: 0, tp: 0 };

  const todayHdp = isActive
    ? computeHdpPercent(todayProduction.tb, currentPopulation)
    : null;

  const { ageDaysRemainder, ageWeeksFloor } = computeCycleAgeParts(
    cycle.start_date,
    periodEnd,
  );

  const feedInPeriod = raw.feed.filter((row) => {
    const ts = normalizeBusinessDate(row.record_date).getTime();
    const start = normalizeBusinessDate(cycle.start_date).getTime();
    const end = periodEnd.getTime();
    return ts >= start && ts <= end;
  });
  const totalFeed = feedInPeriod.reduce((sum, row) => sum + row.quantity, 0);

  const medicalInPeriod = filterMedicalInPeriod(
    raw.medical,
    cycle.start_date,
    periodEnd,
  );

  const averageHdp = computeAverageHdpForPeriod(
    cycle.initial_population,
    raw.mutations,
    raw.production,
    cycle.start_date,
    periodEnd,
  );

  return {
    cycleId: cycle.id,
    startDate: cycle.start_date,
    endDate: cycle.end_date,
    initialPopulation: cycle.initial_population,
    currentPopulation,
    ageWeeks: ageWeeksFloor,
    ageDaysRemainder,
    capacityPercent: computeCapacityPercent(currentPopulation, capacity),
    mutations: mutationTotals,
    production: {
      todayTb: todayProduction.tb,
      todayTr: todayProduction.tr,
      todayTp: todayProduction.tp,
      todayHdp,
      targetHdp,
      averageHdp,
      cumulativeTb: cumulative.tb,
      cumulativeTr: cumulative.tr,
      cumulativeTp: cumulative.tp,
      crackRatio: computeCrackRatio(cumulative.tb, cumulative.tr, cumulative.tp),
    },
    feed: {
      totalQuantity: totalFeed,
      fcr: computeFcr(totalFeed, cumulative.tb),
    },
    medical: {
      eventCount: medicalInPeriod.length,
      mortalityTotal: medicalInPeriod.reduce(
        (sum, row) => sum + row.mortality_count,
        0,
      ),
      sickPopulationMax: medicalInPeriod.reduce(
        (max, row) => Math.max(max, row.sick_population),
        0,
      ),
    },
  };
}

export async function loadCageCycleRawData(
  cageId: string,
  tenantId: string,
): Promise<CageCycleRawData> {
  const [mutations, production, feed, medical] = await Promise.all([
    prisma.populationMutation.findMany({
      where: { cage_id: cageId },
      select: {
        mutation_type: true,
        quantity: true,
        record_date: true,
      },
    }),
    prisma.dailyProduction.findMany({
      where: { cage_id: cageId, tenant_id: tenantId },
      select: {
        record_date: true,
        tb: true,
        tr: true,
        tp: true,
      },
    }),
    prisma.feedConsumption.findMany({
      where: { cage_id: cageId, tenant_id: tenantId },
      select: {
        record_date: true,
        quantity: true,
      },
    }),
    prisma.medicalRecord.findMany({
      where: { cage_id: cageId },
      select: {
        treatment_date: true,
        mortality_count: true,
        sick_population: true,
      },
    }),
  ]);

  return { mutations, production, feed, medical };
}

export async function buildCycleOperationalSummaryAsync(
  cycle: CycleRowInput,
  strainId: number,
  capacity: number,
  raw: CageCycleRawData,
  asOfDate = startOfTodayBusiness(),
): Promise<CycleOperationalSummary> {
  const periodEnd =
    cycle.end_date !== null
      ? normalizeBusinessDate(cycle.end_date)
      : normalizeBusinessDate(asOfDate);

  const { ageWeeksFloor } = computeCycleAgeParts(cycle.start_date, periodEnd);
  const targetHdp =
    cycle.status === "Active"
      ? await lookupTargetHdp(strainId, ageWeeksFloor)
      : null;

  return buildCycleOperationalSummary(
    cycle,
    strainId,
    capacity,
    raw,
    asOfDate,
    targetHdp,
  );
}

export async function buildSummariesForCycles(
  cycles: CycleRowInput[],
  strainId: number,
  capacity: number,
  raw: CageCycleRawData,
  asOfDate = startOfTodayBusiness(),
): Promise<Map<string, CycleOperationalSummary>> {
  const summaries = new Map<string, CycleOperationalSummary>();

  await Promise.all(
    cycles.map(async (cycle) => {
      const summary = await buildCycleOperationalSummaryAsync(
        cycle,
        strainId,
        capacity,
        raw,
        asOfDate,
      );
      summaries.set(cycle.id, summary);
    }),
  );

  return summaries;
}
