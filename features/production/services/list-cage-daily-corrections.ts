import { isUserAssignedToCage } from "@/features/cages/services/is-user-assigned-to-cage";
import type { CorrectionChange } from "@/features/production/schemas/correction-meta";
import { normalizeBusinessDate } from "@/lib/business-date";
import prisma from "@/lib/prisma";

export type DailyCorrectionTimelineItem = {
  id: string;
  reason: string;
  actorName: string;
  createdAt: Date;
  changes: CorrectionChange[];
};

export async function listCageDailyCorrections(
  tenantId: string,
  userId: string,
  cageId: string,
  recordDate: Date,
): Promise<DailyCorrectionTimelineItem[] | null> {
  const assigned = await isUserAssignedToCage(userId, cageId);
  if (!assigned) {
    return null;
  }

  const cage = await prisma.cage.findFirst({
    where: { id: cageId, location: { tenant_id: tenantId } },
    select: { id: true },
  });

  if (!cage) {
    return null;
  }

  const date = normalizeBusinessDate(recordDate);
  const report = await prisma.dailyReport.findUnique({
    where: {
      tenant_id_cage_id_record_date: {
        tenant_id: tenantId,
        cage_id: cageId,
        record_date: date,
      },
    },
    select: { id: true },
  });

  if (!report) {
    return [];
  }

  const rows = await prisma.dailyInputCorrection.findMany({
    where: { daily_report_id: report.id },
    include: {
      actor: { select: { full_name: true, username: true } },
    },
    orderBy: { created_at: "desc" },
  });

  return rows.map((row) => ({
    id: row.id,
    reason: row.reason,
    actorName: row.actor.full_name || row.actor.username,
    createdAt: row.created_at,
    changes: row.changes as CorrectionChange[],
  }));
}
