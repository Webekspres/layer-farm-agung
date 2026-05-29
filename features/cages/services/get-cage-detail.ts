import prisma from "@/lib/prisma";

export type CageDetail = {
  id: string;
  name: string;
  capacity: number;
  status: string;
  cageType: string | null;
  location: { id: string; name: string };
  strain: { id: number; name: string };
  activeCycle: {
    id: string;
    startDate: Date;
    initialPopulation: number;
    status: string;
  } | null;
  history: Array<{
    id: string;
    startDate: Date;
    endDate: Date | null;
    initialPopulation: number;
    status: string;
  }>;
};

export async function getCageDetail(
  cageId: string,
  tenantId: string,
): Promise<CageDetail | null> {
  const cage = await prisma.cage.findFirst({
    where: {
      id: cageId,
      location: { tenant_id: tenantId },
    },
    include: {
      location: { select: { id: true, name: true } },
      strain: { select: { id: true, name: true } },
      cycle_settings: {
        orderBy: { start_date: "desc" },
      },
    },
  });

  if (!cage) return null;

  const activeCycleRow = cage.cycle_settings.find((c) => c.status === "Active") ?? null;
  const historyRows = cage.cycle_settings.filter((c) => c.status !== "Active");

  return {
    id: cage.id,
    name: cage.name,
    capacity: cage.capacity,
    status: cage.status,
    cageType: cage.cage_type,
    location: cage.location,
    strain: cage.strain,
    activeCycle: activeCycleRow
      ? {
          id: activeCycleRow.id,
          startDate: activeCycleRow.start_date,
          initialPopulation: activeCycleRow.initial_population,
          status: activeCycleRow.status,
        }
      : null,
    history: historyRows.map((h) => ({
      id: h.id,
      startDate: h.start_date,
      endDate: h.end_date,
      initialPopulation: h.initial_population,
      status: h.status,
    })),
  };
}
