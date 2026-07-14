import { computeCyclePopulation } from "@/features/cages/lib/compute-cycle-population";
import { cycleAgeInWeeks } from "@/features/cages/lib/cycle-age-weeks";
import { computeHdpPercent } from "@/features/production/lib/compute-hdp";
import {
  formatBusinessDate,
  normalizeBusinessDate,
  shiftBusinessDate,
} from "@/lib/business-date";

export type MutationTotals = {
  masuk: number;
  mati: number;
  afkir: number;
  pindah: number;
};

export type PopulationMutationLike = {
  mutation_type: string;
  quantity: number;
  record_date: Date;
};

export type DailyProductionLike = {
  record_date: Date;
  tb: number;
  tr: number;
  tp: number;
};

export function aggregateMutationTotals(
  mutations: PopulationMutationLike[],
  startDate: Date,
  endDate: Date,
): MutationTotals {
  const start = normalizeBusinessDate(startDate).getTime();
  const end = normalizeBusinessDate(endDate).getTime();

  const totals: MutationTotals = { masuk: 0, mati: 0, afkir: 0, pindah: 0 };

  for (const row of mutations) {
    const ts = normalizeBusinessDate(row.record_date).getTime();
    if (ts < start || ts > end) continue;

    switch (row.mutation_type) {
      case "Masuk":
        totals.masuk += row.quantity;
        break;
      case "Mati":
        totals.mati += row.quantity;
        break;
      case "Afkir":
        totals.afkir += row.quantity;
        break;
      case "Pindah":
        totals.pindah += row.quantity;
        break;
      default:
        break;
    }
  }

  return totals;
}

export function sumProductionInPeriod(
  rows: DailyProductionLike[],
  startDate: Date,
  endDate: Date,
) {
  const start = normalizeBusinessDate(startDate).getTime();
  const end = normalizeBusinessDate(endDate).getTime();

  let tb = 0;
  let tr = 0;
  let tp = 0;

  for (const row of rows) {
    const ts = normalizeBusinessDate(row.record_date).getTime();
    if (ts < start || ts > end) continue;
    tb += row.tb;
    tr += row.tr;
    tp += row.tp;
  }

  return { tb, tr, tp };
}

export function sumProductionOnDate(
  rows: DailyProductionLike[],
  recordDate: Date,
) {
  const target = formatBusinessDate(normalizeBusinessDate(recordDate));
  let tb = 0;
  let tr = 0;
  let tp = 0;

  for (const row of rows) {
    if (formatBusinessDate(row.record_date) !== target) continue;
    tb += row.tb;
    tr += row.tr;
    tp += row.tp;
  }

  return { tb, tr, tp };
}

export function computeCrackRatio(tb: number, tr: number, tp: number): number | null {
  const total = tb + tr + tp;
  if (total <= 0) return null;
  return (tr + tp) / total;
}

export function computeFcr(feedQuantity: number, tb: number): number | null {
  if (tb <= 0 || feedQuantity <= 0) return null;
  return feedQuantity / tb;
}

export function computeCapacityPercent(
  currentPopulation: number,
  capacity: number,
): number | null {
  if (capacity <= 0) return null;
  return (currentPopulation / capacity) * 100;
}

export function computeCycleAgeParts(startDate: Date, asOfDate: Date) {
  const start = normalizeBusinessDate(startDate);
  const asOf = normalizeBusinessDate(asOfDate);
  const diffMs = Math.max(0, asOf.getTime() - start.getTime());
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const ageWeeks = Math.floor(totalDays / 7);
  const ageDaysRemainder = totalDays % 7;
  return { ageWeeks, ageDaysRemainder, ageWeeksFloor: cycleAgeInWeeks(start, asOf) };
}

export function computeAverageHdpForPeriod(
  initialPopulation: number,
  mutations: PopulationMutationLike[],
  productionRows: DailyProductionLike[],
  startDate: Date,
  endDate: Date,
): number | null {
  const start = normalizeBusinessDate(startDate);
  const end = normalizeBusinessDate(endDate);
  const hdpValues: number[] = [];

  let day = start;
  while (day.getTime() <= end.getTime()) {
    const dayProduction = sumProductionOnDate(productionRows, day);
    if (dayProduction.tb > 0) {
      const population = computeCyclePopulation(initialPopulation, mutations, day);
      const hdp = computeHdpPercent(dayProduction.tb, population);
      if (hdp !== null) hdpValues.push(hdp);
    }
    day = shiftBusinessDate(day, 1);
  }

  if (hdpValues.length === 0) return null;
  return hdpValues.reduce((sum, value) => sum + value, 0) / hdpValues.length;
}

export function filterRowsInPeriod<T extends { record_date: Date }>(
  rows: T[],
  startDate: Date,
  endDate: Date,
): T[] {
  const start = normalizeBusinessDate(startDate).getTime();
  const end = normalizeBusinessDate(endDate).getTime();
  return rows.filter((row) => {
    const ts = normalizeBusinessDate(row.record_date).getTime();
    return ts >= start && ts <= end;
  });
}

export function filterMedicalInPeriod<T extends { treatment_date: Date }>(
  rows: T[],
  startDate: Date,
  endDate: Date,
): T[] {
  const start = normalizeBusinessDate(startDate).getTime();
  const end = normalizeBusinessDate(endDate).getTime();
  return rows.filter((row) => {
    const ts = normalizeBusinessDate(row.treatment_date).getTime();
    return ts >= start && ts <= end;
  });
}
