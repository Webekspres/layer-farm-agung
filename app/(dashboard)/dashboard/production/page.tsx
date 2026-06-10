import { PageHeader } from "@/components/layout/page-header";
import { TenantRequiredPanel } from "@/features/master-data/components/tenant-required-panel";
import { DailyProductionRecapTable } from "@/features/production/components/daily-production-recap-table";
import {
  getProductionTenantScope,
  requireManageProductionSession,
} from "@/features/production/lib/access";
import { listDailyProductionRecap } from "@/features/production/services/list-daily-production-recap";

function todayLabel() {
  return new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function ProductionPage() {
  const session = await requireManageProductionSession();
  const { tenantId, needsTenantSelection } = getProductionTenantScope(session);
  const recordDateLabel = todayLabel();

  const rows =
    tenantId && !needsTenantSelection
      ? await listDailyProductionRecap(tenantId)
      : [];

  return (
    <>
      <PageHeader
        title="Produksi"
        description={`Rekap produksi telur harian — ${recordDateLabel}. Input lapangan via aplikasi mobile.`}
      />
      {needsTenantSelection ? (
        <TenantRequiredPanel />
      ) : (
        <DailyProductionRecapTable rows={rows} recordDateLabel={recordDateLabel} />
      )}
    </>
  );
}
