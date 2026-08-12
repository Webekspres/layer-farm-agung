import { normalizeBusinessDate } from "@/lib/business-date";
import type { CorrectionChange } from "@/features/production/schemas/correction-meta";
import prisma from "@/lib/prisma";

export type DailyCorrectionRecapRow = {
  id: string;
  cageId: string;
  cageName: string;
  locationName: string;
  reason: string;
  actorName: string;
  createdAt: Date;
  changes: CorrectionChange[];
};

export async function listDailyCorrectionsRecap(
  tenantId: string,
  recordDate: Date,
  cageId?: string,
): Promise<DailyCorrectionRecapRow[]> {
  const date = normalizeBusinessDate(recordDate);

  const rows = await prisma.dailyInputCorrection.findMany({
    where: {
      daily_report: {
        tenant_id: tenantId,
        record_date: date,
        ...(cageId ? { cage_id: cageId } : {}),
      },
    },
    include: {
      actor: { select: { full_name: true, username: true } },
      daily_report: {
        include: {
          cage: {
            select: {
              id: true,
              name: true,
              location: { select: { name: true } },
            },
          },
        },
      },
    },
    orderBy: { created_at: "desc" },
  });

  return rows.map((row) => ({
    id: row.id,
    cageId: row.daily_report.cage.id,
    cageName: row.daily_report.cage.name,
    locationName: row.daily_report.cage.location.name,
    reason: row.reason,
    actorName: row.actor.full_name || row.actor.username,
    createdAt: row.created_at,
    changes: row.changes as CorrectionChange[],
  }));
}
