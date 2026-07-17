import type {
  DashboardEarlyWarning,
  DashboardMortalityWarning,
  LowStockAlert,
} from "@/features/dashboard/lib/dashboard-executive-types";
import { formatBusinessDate } from "@/lib/business-date";
import prisma from "@/lib/prisma";

type SyncDashboardAlertsInput = {
  tenantId: string;
  recordDate: Date;
  hdpWarnings: DashboardEarlyWarning[];
  mortalityWarnings: DashboardMortalityWarning[];
  lowStockAlerts: LowStockAlert[];
};

type AlertDraft = {
  key: string;
  type: "HDP_DROP" | "MORTALITY_SPIKE" | "LOW_STOCK";
  severity: "Warning" | "Critical";
  title: string;
  message: string;
  source: string;
  sourceId: string;
  recordDate: Date;
};

function buildDashboardAlertDrafts({
  recordDate,
  hdpWarnings,
  mortalityWarnings,
  lowStockAlerts,
}: Omit<SyncDashboardAlertsInput, "tenantId">): AlertDraft[] {
  const dateKey = formatBusinessDate(recordDate);

  return [
    ...hdpWarnings.map((warning) => ({
      key: `hdp:${dateKey}:${warning.cageId}`,
      type: "HDP_DROP" as const,
      severity: "Warning" as const,
      title: "HDP di bawah target",
      message: `${warning.cageName}: HDP ${warning.actualHdp.toFixed(1)}% di bawah target ${warning.targetHdp.toFixed(1)}%.`,
      source: "Cage",
      sourceId: warning.cageId,
      recordDate,
    })),
    ...mortalityWarnings.map((warning) => ({
      key: `mortality:${dateKey}:${warning.cageId}`,
      type: "MORTALITY_SPIKE" as const,
      severity: "Critical" as const,
      title: "Mortalitas melewati ambang",
      message: `${warning.cageName}: ${warning.deaths.toLocaleString("id-ID")} ekor mati dalam 7 hari terakhir.`,
      source: "Cage",
      sourceId: warning.cageId,
      recordDate,
    })),
    ...lowStockAlerts.map((alert) => ({
      key: `stock:${alert.id}`,
      type: "LOW_STOCK" as const,
      severity: "Warning" as const,
      title: "Stok saprodi rendah",
      message: `${alert.name}: stok ${alert.totalQuantity.toLocaleString("id-ID")} ${alert.unit}, minimum ${alert.minStockAlert.toLocaleString("id-ID")} ${alert.unit}.`,
      source: "Item",
      sourceId: alert.id,
      recordDate,
    })),
  ];
}

export async function syncDashboardAlerts(input: SyncDashboardAlertsInput) {
  const drafts = buildDashboardAlertDrafts(input);
  const activeKeys = drafts.map((draft) => draft.key);

  await prisma.$transaction(async (tx) => {
    for (const draft of drafts) {
      await tx.alertLog.upsert({
        where: {
          tenant_id_alert_key: {
            tenant_id: input.tenantId,
            alert_key: draft.key,
          },
        },
        create: {
          tenant_id: input.tenantId,
          alert_key: draft.key,
          type: draft.type,
          severity: draft.severity,
          title: draft.title,
          message: draft.message,
          source: draft.source,
          source_id: draft.sourceId,
          record_date: draft.recordDate,
        },
        update: {
          severity: draft.severity,
          title: draft.title,
          message: draft.message,
          source: draft.source,
          source_id: draft.sourceId,
          record_date: draft.recordDate,
          resolved_at: null,
        },
      });
    }

    await tx.alertLog.updateMany({
      where: {
        tenant_id: input.tenantId,
        type: { in: ["HDP_DROP", "MORTALITY_SPIKE", "LOW_STOCK"] },
        resolved_at: null,
        ...(activeKeys.length > 0
          ? { alert_key: { notIn: activeKeys } }
          : {}),
      },
      data: { resolved_at: new Date() },
    });
  });
}
