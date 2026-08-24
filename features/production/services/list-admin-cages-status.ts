import { startOfTodayUtc } from "@/features/production/lib/parse-production-date";
import { normalizeBusinessDate } from "@/lib/business-date";
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
  hasCorrections: boolean;
  /** True saat recordDate berada di rentang [start_date, go_live_date) — Pra-Go-Live. */
  preGoLive: boolean;
};

export async function listAdminCagesStatus(
  tenantId: string,
  recordDate = startOfTodayUtc(),
): Promise<AdminCageStatusItem[]> {
  const cages = await prisma.cage.findMany({
    where: {
      status: "Active",
      location: { tenant_id: tenantId },
    //   Hanya menampilkan kandang yang siklus nya sedang aktif
      cycle_settings: { some: { status: "Active" } },
    },
    include: {
      location: { select: { name: true } },
      strain: { select: { name: true } },
      cycle_settings: {
        where: { status: "Active" },
        orderBy: { start_date: "desc" },
        take: 1,
        select: { start_date: true, go_live_date: true },
      },
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
      daily_reports: {
        where: {
          tenant_id: tenantId,
          record_date: recordDate,
        },
        take: 1,
        select: {
          id: true,
          corrections: { take: 1, select: { id: true } },
        },
      },
    },
    orderBy: [
      { location: { name: "asc" } },
      { name: "asc" },
    ],
  });

  return cages.map((cage) => {
    const activeCycle = cage.cycle_settings[0] ?? null;
    const recordTs = normalizeBusinessDate(recordDate).getTime();
    const preGoLive =
      activeCycle !== null &&
      activeCycle.go_live_date !== null &&
      recordTs >= normalizeBusinessDate(activeCycle.start_date).getTime() &&
      recordTs < normalizeBusinessDate(activeCycle.go_live_date).getTime();

    return {
      id: cage.id,
      name: cage.name,
      locationName: cage.location.name,
      strainName: cage.strain.name,
      hasEggs: cage.daily_productions.length > 0,
      hasFeed: cage.feed_consumptions.length > 0,
      hasPopulation: cage.population_mutations.length > 0,
      hasMedical: cage.medical_records.length > 0,
      hasCorrections:
        (cage.daily_reports[0]?.corrections.length ?? 0) > 0,
      preGoLive,
    };
  });
}
