import { resolveActiveCyclePopulation } from "@/features/cages/services/resolve-active-cycle-population";
import {
  computeFcr,
  sumEggMassKgInPeriod,
} from "@/features/cages/lib/cycle-operational-metrics";
import { normalizeBusinessDate, startOfTodayBusiness } from "@/lib/business-date";
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
  /** FCR siklus aktif = total pakan (kg) ÷ egg mass (kg). Null bila belum ada data berat telur. */
  cycleFcr: number | null;
  /** Total konsumsi pakan (kg) siklus aktif sampai hari ini. */
  cycleFeedKg: number;
  /** Egg mass (kg) = Σ((TB+TR+TP) × berat) ÷ 1000 untuk siklus aktif. */
  cycleEggMassKg: number;
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
        select: { id: true, start_date: true, go_live_date: true },
      },
    },
  });

  if (!row) return null;

  const activeCycle = row.cycle_settings[0];
  const activeCyclePopulation = activeCycle
    ? await resolveActiveCyclePopulation(cageId)
    : null;

  let cycleFcr: number | null = null;
  let cycleFeedKg = 0;
  let cycleEggMassKg = 0;

  if (activeCycle) {
    const periodEnd = startOfTodayBusiness();
    const periodStart = normalizeBusinessDate(
      activeCycle.go_live_date ?? activeCycle.start_date,
    );

    const [feedAgg, productionRows] = await Promise.all([
      prisma.feedConsumption.aggregate({
        where: {
          cage_id: cageId,
          record_date: { gte: periodStart, lte: periodEnd },
        },
        _sum: { quantity: true },
      }),
      prisma.dailyProduction.findMany({
        where: {
          cage_id: cageId,
          record_date: { gte: periodStart, lte: periodEnd },
        },
        select: {
          record_date: true,
          tb: true,
          tr: true,
          tp: true,
          weight: true,
        },
      }),
    ]);

    cycleFeedKg = Number((feedAgg._sum.quantity ?? 0).toFixed(1));
    cycleEggMassKg = Number(
      sumEggMassKgInPeriod(productionRows, periodStart, periodEnd).toFixed(1),
    );
    cycleFcr = computeFcr(cycleFeedKg, cycleEggMassKg);
  }

  return {
    id: row.id,
    name: row.name,
    locationName: row.location.name,
    strainName: row.strain.name,
    status: row.status,
    hasActiveCycle: Boolean(activeCycle),
    activeCyclePopulation,
    cycleFcr,
    cycleFeedKg,
    cycleEggMassKg,
  };
}
