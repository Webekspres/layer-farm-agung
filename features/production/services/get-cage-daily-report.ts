import { normalizeBusinessDate } from "@/lib/business-date";
import prisma from "@/lib/prisma";
import {
  listCageDailyHistory,
  type CageDailyHistory,
} from "@/features/production/services/list-cage-daily-history";

export type DailyReportBundle = CageDailyHistory & {
  reportId: string | null;
  correctionCount: number;
  status: {
    production: "reported" | "unreported";
    feed: "reported" | "unreported";
    population: "reported" | "unreported";
    medical: "reported" | "unreported";
  };
};

export async function getCageDailyReport(
  tenantId: string,
  userId: string,
  cageId: string,
  recordDate: Date,
): Promise<DailyReportBundle | null> {
  const history = await listCageDailyHistory(
    tenantId,
    userId,
    cageId,
    recordDate,
  );

  if (!history) {
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
    select: {
      id: true,
      _count: { select: { corrections: true } },
    },
  });

  return {
    ...history,
    reportId: report?.id ?? null,
    correctionCount: report?._count.corrections ?? 0,
    status: {
      production:
        history.productions.length > 0 ? "reported" : "unreported",
      feed: history.feed.length > 0 ? "reported" : "unreported",
      population:
        history.population.length > 0 ? "reported" : "unreported",
      medical: history.medical.length > 0 ? "reported" : "unreported",
    },
  };
}
