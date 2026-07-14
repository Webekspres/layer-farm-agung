import {
  getAssignedStaffIds,
  getCageQrCode,
} from "@/features/cages/lib/cage-staff-db";
import {
  buildSummariesForCycles,
  loadCageCycleRawData,
  type CycleOperationalSummary,
} from "@/features/cages/services/get-cycle-operational-summary";
import { startOfTodayBusiness } from "@/lib/business-date";
import prisma from "@/lib/prisma";

export type CageCycleDetail = {
  id: string;
  startDate: Date;
  endDate: Date | null;
  initialPopulation: number;
  status: string;
  summary: CycleOperationalSummary;
};

export type CageDetail = {
  id: string;
  name: string;
  qrCode: string;
  capacity: number;
  status: string;
  cageType: string | null;
  location: { id: string; name: string };
  strain: { id: number; name: string };
  assignedStaffIds: string[];
  activeCycle: CageCycleDetail | null;
  history: CageCycleDetail[];
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

  const cycleSettings = cage.cycle_settings;

  const [qrCode, assignedStaffIds, raw] = await Promise.all([
    getCageQrCode(cage.id),
    getAssignedStaffIds(cage.id),
    loadCageCycleRawData(cage.id, tenantId),
  ]);

  const asOfDate = startOfTodayBusiness();
  const summaryMap = await buildSummariesForCycles(
    cycleSettings,
    cage.strain.id,
    cage.capacity,
    raw,
    asOfDate,
  );

  const activeCycleRow =
    cycleSettings.find((cycle) => cycle.status === "Active") ?? null;
  const historyRows = cycleSettings
    .filter((cycle) => cycle.status !== "Active")
    .sort((a, b) => {
      const aEnd = a.end_date?.getTime() ?? 0;
      const bEnd = b.end_date?.getTime() ?? 0;
      if (bEnd !== aEnd) return bEnd - aEnd;
      return b.start_date.getTime() - a.start_date.getTime();
    });

  function toCycleDetail(
    row: (typeof cycleSettings)[number],
  ): CageCycleDetail {
    const summary = summaryMap.get(row.id);
    if (!summary) {
      throw new Error(`Ringkasan siklus tidak ditemukan: ${row.id}`);
    }

    return {
      id: row.id,
      startDate: row.start_date,
      endDate: row.end_date,
      initialPopulation: row.initial_population,
      status: row.status,
      summary,
    };
  }

  return {
    id: cage.id,
    name: cage.name,
    qrCode: qrCode ?? "",
    capacity: cage.capacity,
    status: cage.status,
    cageType: cage.cage_type,
    location: cage.location,
    strain: cage.strain,
    assignedStaffIds,
    activeCycle: activeCycleRow ? toCycleDetail(activeCycleRow) : null,
    history: historyRows.map(toCycleDetail),
  };
}
