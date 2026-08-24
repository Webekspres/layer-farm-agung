/**
 * Computes live flock population for an active cycle from initial count and
 * recorded mutations up to (and including) `asOfDate`.
 *
 * `fromDate` isolates the cycle: mutations recorded before it (e.g. data from a
 * previous cycle) are ignored, so a new cycle never inherits stale population.
 */
import { normalizeBusinessDate } from "@/lib/business-date";

export type PopulationMutationRow = {
  mutation_type: string;
  quantity: number;
  record_date: Date;
};

export function computeCyclePopulation(
  initialPopulation: number,
  mutations: PopulationMutationRow[],
  asOfDate: Date,
  fromDate?: Date,
): number {
  const end = normalizeBusinessDate(asOfDate).getTime();
  const from = fromDate ? normalizeBusinessDate(fromDate).getTime() : null;

  let current = initialPopulation;

  for (const row of mutations) {
    const ts = normalizeBusinessDate(row.record_date).getTime();
    if (ts > end) {
      continue;
    }
    if (from !== null && ts < from) {
      continue;
    }

    switch (row.mutation_type) {
      case "Masuk":
        current += row.quantity;
        break;
      case "Mati":
      case "Afkir":
      case "Pindah":
        current -= row.quantity;
        break;
      default:
        break;
    }
  }

  return Math.max(0, current);
}

/** Mutation types that reduce population — require stock check before submit. */
export const POPULATION_DECREASE_TYPES = ["Mati", "Afkir", "Pindah"] as const;

export function isPopulationDecreaseType(mutationType: string): boolean {
  return (POPULATION_DECREASE_TYPES as readonly string[]).includes(mutationType);
}
