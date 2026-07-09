import { resolveActiveCyclePopulation } from "@/features/cages/services/resolve-active-cycle-population";
import prisma from "@/lib/prisma";
import { isUuid } from "@/lib/uuid";

export type CageForProduction = {
  id: string;
  name: string;
  locationName: string;
  strainName: string;
  status: string;
  hasActiveCycle: boolean;
  activeCyclePopulation: number | null;
};

export async function getCageForProduction(
  tenantId: string,
  cageId: string,
): Promise<CageForProduction | null> {
  if (!isUuid(cageId)) {
    return null;
  }

  const row = await prisma.cage.findFirst({
    where: {
      id: cageId,
      location: { tenant_id: tenantId },
    },
    include: {
      location: { select: { name: true } },
      strain: { select: { name: true } },
      cycle_settings: {
        where: { status: "Active" },
        take: 1,
        orderBy: { start_date: "desc" },
        select: { id: true },
      },
    },
  });

  if (!row) return null;

  const activeCycle = row.cycle_settings[0];
  const activeCyclePopulation = activeCycle
    ? await resolveActiveCyclePopulation(cageId)
    : null;

  return {
    id: row.id,
    name: row.name,
    locationName: row.location.name,
    strainName: row.strain.name,
    status: row.status,
    hasActiveCycle: Boolean(activeCycle),
    activeCyclePopulation,
  };
}
