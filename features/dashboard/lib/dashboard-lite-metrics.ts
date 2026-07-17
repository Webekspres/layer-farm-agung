import { computeFcr } from "@/features/cages/lib/cycle-operational-metrics";

/** Flag mortalitas 7 hari jika total Mati kandang ≥ ambang ini. */
export const MORTALITY_WEEK_WARNING_THRESHOLD = 5;

export type MortalityAggRow = {
  cageId: string;
  cageName: string;
  deaths: number;
};

/** Kandang dengan kematian (Mati) 7 hari di atas ambang. */
export function buildMortalityWarnings(
  rows: MortalityAggRow[],
  threshold = MORTALITY_WEEK_WARNING_THRESHOLD,
): MortalityAggRow[] {
  return rows
    .filter((row) => row.deaths >= threshold)
    .sort((a, b) => b.deaths - a.deaths);
}

export function buildFcrSnapshot(feedKg: number, tb: number): number | null {
  return computeFcr(feedKg, tb);
}

export function buildCashWeekBalance(income: number, expense: number): number {
  return income - expense;
}
