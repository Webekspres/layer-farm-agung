/**
 * Computes live flock population for an active cycle from initial count and
 * recorded mutations up to (and including) `asOfDate`.
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
): number {
  const end = normalizeBusinessDate(asOfDate).getTime();

  let current = initialPopulation;

  for (const row of mutations) {
    if (normalizeBusinessDate(row.record_date).getTime() > end) {
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
