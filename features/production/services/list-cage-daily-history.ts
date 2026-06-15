import { isUserAssignedToCage } from "@/features/cages/services/is-user-assigned-to-cage";
import { startOfTodayUtc } from "@/features/production/lib/parse-production-date";
import prisma from "@/lib/prisma";

export type CageProductionHistoryItem = {
  id: string;
  tb: number;
  tr: number;
  tp: number;
  total: number;
  recordedBy: string;
  createdAt: Date;
};

export type CageDailyHistory = {
  recordDate: Date;
  cageId: string;
  cageName: string;
  locationName: string;
  productions: CageProductionHistoryItem[];
  feed: [];
  population: [];
  medical: [];
};

export async function listCageDailyHistory(
  tenantId: string,
  userId: string,
  cageId: string,
  recordDate = startOfTodayUtc(),
): Promise<CageDailyHistory | null> {
  const assigned = await isUserAssignedToCage(userId, cageId);

  if (!assigned) {
    return null;
  }

  const cage = await prisma.cage.findFirst({
    where: {
      id: cageId,
      location: { tenant_id: tenantId },
    },
    select: {
      id: true,
      name: true,
      location: { select: { name: true } },
    },
  });

  if (!cage) {
    return null;
  }

  const productions = await prisma.dailyProduction.findMany({
    where: {
      tenant_id: tenantId,
      cage_id: cageId,
      record_date: recordDate,
    },
    include: {
      user: { select: { full_name: true, username: true } },
    },
    orderBy: { created_at: "asc" },
  });

  return {
    recordDate,
    cageId: cage.id,
    cageName: cage.name,
    locationName: cage.location.name,
    productions: productions.map((row) => ({
      id: row.id,
      tb: row.tb,
      tr: row.tr,
      tp: row.tp,
      total: row.tb + row.tr + row.tp,
      recordedBy: row.user.full_name || row.user.username,
      createdAt: row.created_at,
    })),
    feed: [],
    population: [],
    medical: [],
  };
}
