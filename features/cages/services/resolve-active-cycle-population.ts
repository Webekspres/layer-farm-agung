import {
  computeCyclePopulation,
  isPopulationDecreaseType,
} from "@/features/cages/lib/compute-cycle-population";
import { normalizeBusinessDate } from "@/lib/business-date";
import prisma from "@/lib/prisma";

/**
 * Resolves the active cycle for a cage and returns computed population as of
 * `asOfDate`, or null when no active cycle exists.
 */
export async function resolveActiveCyclePopulation(
  cageId: string,
  asOfDate = new Date(),
): Promise<number | null> {
  const cycle = await prisma.cycleSetting.findFirst({
    where: { cage_id: cageId, status: "Active" },
    orderBy: { start_date: "desc" },
    select: {
      id: true,
      initial_population: true,
      start_date: true,
    },
  });

  if (!cycle) return null;

  const mutations = await prisma.populationMutation.findMany({
    where: {
      cage_id: cageId,
      record_date: { lte: normalizeBusinessDate(asOfDate) },
    },
    select: {
      mutation_type: true,
      quantity: true,
      record_date: true,
    },
    orderBy: { record_date: "asc" },
  });

  return computeCyclePopulation(
    cycle.initial_population,
    mutations,
    asOfDate,
  );
}

export { isPopulationDecreaseType };
