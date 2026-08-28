import {
  enumerateBusinessDates,
  fillSeries,
  shortDateLabel,
  toDateKeyMap,
} from "@/features/dashboard/lib/dashboard-series";
import { computeFcr } from "@/features/cages/lib/cycle-operational-metrics";
import { computeHdpPercent } from "@/features/production/lib/compute-hdp";
import {
  formatBusinessDate,
  shiftBusinessDate,
  startOfTodayBusiness,
} from "@/lib/business-date";

export type FieldOverviewPoint = {
  date: string;
  label: string;
  eggs: number;
};

export type FieldOverviewHdpPoint = {
  date: string;
  label: string;
  hdp: number | null;
  target: number | null;
};

export type FieldOverviewIncompleteCage = {
  id: string;
  name: string;
};

export type FieldOverview = {
  recordDate: string;
  populationTotal: number;
  cagesActive: number;
  recordedTodayCount: number;
  todayTb: number;
  todayTr: number;
  todayTp: number;
  todayHdp: number | null;
  targetHdpAvg: number | null;
  pendingVaccineCount: number;
  overdueVaccineCount: number;
  /** FCR siklus aktif (kg pakan ÷ egg mass kg); null jika data belum lengkap. */
  cycleFcr: number | null;
  cycleFeedKg: number;
  cycleEggMassKg: number;
  production7d: FieldOverviewPoint[];
  hdp7d: FieldOverviewHdpPoint[];
  incompleteCages: FieldOverviewIncompleteCage[];
};

export type FieldOverviewCageInput = {
  id: string;
  name: string;
  population: number;
  recordedToday: boolean;
  targetHdp: number | null;
};

export type FieldOverviewBuildInput = {
  recordDate: Date;
  cages: FieldOverviewCageInput[];
  todayTb: number;
  todayTr: number;
  todayTp: number;
  pendingVaccineCount: number;
  overdueVaccineCount: number;
  /** Total pakan (kg) seluruh siklus aktif dalam lingkup — utk FCR. Default 0. */
  cycleFeedKg?: number;
  /** Total egg mass (kg) seluruh siklus aktif dalam lingkup — utk FCR. Default 0. */
  cycleEggMassKg?: number;
  /** True bila ada hari produksi tanpa berat — FCR siklus disembunyikan. */
  cycleFcrBlocked?: boolean;
  /** Daily total telur (seluruh grade) keyed by business date string (YYYY-MM-DD). */
  eggsByDate: Map<string, number>;
};

function round1(value: number): number {
  return Number(value.toFixed(1));
}

export function emptyFieldOverview(recordDate: Date): FieldOverview {
  const dates7 = enumerateBusinessDates(recordDate, 7);
  const production7d = fillSeries(dates7, new Map()).map((p) => ({
    date: p.date,
    label: p.label,
    eggs: p.value,
  }));
  const hdp7d = production7d.map((point) => ({
    date: point.date,
    label: point.label,
    hdp: null as number | null,
    target: null as number | null,
  }));

  return {
    recordDate: formatBusinessDate(recordDate),
    populationTotal: 0,
    cagesActive: 0,
    recordedTodayCount: 0,
    todayTb: 0,
    todayTr: 0,
    todayTp: 0,
    todayHdp: null,
    targetHdpAvg: null,
    pendingVaccineCount: 0,
    overdueVaccineCount: 0,
    cycleFcr: null,
    cycleFeedKg: 0,
    cycleEggMassKg: 0,
    production7d,
    hdp7d,
    incompleteCages: [],
  };
}

/**
 * Pure builder for staff field overview — easy to unit-test without Prisma.
 */
export function buildFieldOverview(
  input: FieldOverviewBuildInput,
): FieldOverview {
  const { recordDate, cages } = input;

  if (cages.length === 0) {
    return emptyFieldOverview(recordDate);
  }

  const populationTotal = cages.reduce((sum, c) => sum + c.population, 0);
  const recordedTodayCount = cages.filter((c) => c.recordedToday).length;
  const todayTotal = input.todayTb + input.todayTr + input.todayTp;
  const todayHdp = computeHdpPercent(todayTotal, populationTotal);

  const targets = cages
    .map((c) => c.targetHdp)
    .filter((t): t is number => t != null);
  const targetHdpAvg =
    targets.length > 0
      ? round1(targets.reduce((a, b) => a + b, 0) / targets.length)
      : null;

  const dates7 = enumerateBusinessDates(recordDate, 7);
  const production7d = fillSeries(dates7, input.eggsByDate).map((p) => ({
    date: p.date,
    label: p.label,
    eggs: p.value,
  }));

  const hdp7d: FieldOverviewHdpPoint[] = production7d.map((point) => {
    // Hari tanpa data produksi (eggs = 0) tidak dihitung sebagai nol —
    // dirender sebagai gap (null) agar Pra-Go-Live / hari kosong tak tampak 0%.
    const hdp =
      populationTotal > 0 && point.eggs > 0
        ? round1((point.eggs / populationTotal) * 100)
        : null;
    return {
      date: point.date,
      label: point.label,
      hdp,
      target: targetHdpAvg,
    };
  });

  const incompleteCages = cages
    .filter((c) => !c.recordedToday)
    .map((c) => ({ id: c.id, name: c.name }));

  return {
    recordDate: formatBusinessDate(recordDate),
    populationTotal,
    cagesActive: cages.length,
    recordedTodayCount,
    todayTb: input.todayTb,
    todayTr: input.todayTr,
    todayTp: input.todayTp,
    todayHdp: todayHdp == null ? null : round1(todayHdp),
    targetHdpAvg,
    pendingVaccineCount: input.pendingVaccineCount,
    overdueVaccineCount: input.overdueVaccineCount,
    cycleFcr: input.cycleFcrBlocked
      ? null
      : computeFcr(input.cycleFeedKg ?? 0, input.cycleEggMassKg ?? 0),
    cycleFeedKg: input.cycleFeedKg ?? 0,
    cycleEggMassKg: input.cycleEggMassKg ?? 0,
    production7d,
    hdp7d,
    incompleteCages,
  };
}

export { shortDateLabel, toDateKeyMap, shiftBusinessDate, startOfTodayBusiness };
