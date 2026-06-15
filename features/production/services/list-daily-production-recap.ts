import { startOfTodayUtc } from "@/features/production/lib/parse-production-date";
import prisma from "@/lib/prisma";

export type DailyProductionRecapRow = {
  id: string;
  recordDate: Date;
  cageName: string;
  locationName: string;
  tb: number;
  tr: number;
  tp: number;
  weight: number | null;
  recordedBy: string;
  createdAt: Date;
};

export async function listDailyProductionRecap(
  tenantId: string,
  recordDate = startOfTodayUtc(),
): Promise<DailyProductionRecapRow[]> {
  const rows = await prisma.dailyProduction.findMany({
    where: {
      tenant_id: tenantId,
      record_date: recordDate,
    },
    include: {
      cage: {
        select: {
          name: true,
          location: { select: { name: true } },
        },
      },
      user: { select: { full_name: true, username: true } },
    },
    orderBy: [
      { cage: { name: "asc" } },
      { created_at: "asc" },
    ],
  });

  return rows.map((row) => ({
    id: row.id,
    recordDate: row.record_date,
    cageName: row.cage.name,
    locationName: row.cage.location.name,
    tb: row.tb,
    tr: row.tr,
    tp: row.tp,
    weight: row.weight,
    recordedBy: row.user.full_name || row.user.username,
    createdAt: row.created_at,
  }));
}
