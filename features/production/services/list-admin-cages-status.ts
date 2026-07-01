import { startOfTodayUtc } from "@/features/production/lib/parse-production-date";
import prisma from "@/lib/prisma";

export type AdminCageStatusItem = {
  id: string;
  name: string;
  locationName: string;
  strainName: string;
  hasEggs: boolean;
  hasFeed: boolean;
  hasPopulation: boolean;
  hasMedical: boolean;
};

export async function listAdminCagesStatus(
  tenantId: string,
  recordDate = startOfTodayUtc(),
): Promise<AdminCageStatusItem[]> {
  const cages = await prisma.cage.findMany({
    where: {
      status: "Active",
      location: { tenant_id: tenantId },
    },
    include: {
      location: { select: { name: true } },
      strain: { select: { name: true } },
      daily_productions: {
        where: {
          tenant_id: tenantId,
          record_date: recordDate,
        },
        take: 1,
        select: { id: true },
      },
      feed_consumptions: {
        where: {
          tenant_id: tenantId,
          record_date: recordDate,
        },
        take: 1,
        select: { id: true },
      },
      population_mutations: {
        where: {
          record_date: recordDate,
        },
        take: 1,
        select: { id: true },
      },
      medical_records: {
        where: {
          treatment_date: recordDate,
        },
        take: 1,
        select: { id: true },
      },
    },
    orderBy: [
      { location: { name: "asc" } },
      { name: "asc" },
    ],
  });

  return cages.map((cage) => ({
    id: cage.id,
    name: cage.name,
    locationName: cage.location.name,
    strainName: cage.strain.name,
    hasEggs: cage.daily_productions.length > 0,
    hasFeed: cage.feed_consumptions.length > 0,
    hasPopulation: cage.population_mutations.length > 0,
    hasMedical: cage.medical_records.length > 0,
  }));
}
