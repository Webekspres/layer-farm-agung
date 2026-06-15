import { Suspense } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { TenantRequiredPanel } from "@/features/master-data/components/tenant-required-panel";
import { DailyInputRecapEmptyPanel } from "@/features/production/components/daily-input-recap-empty-panel";
import { DailyInputRecapTabs } from "@/features/production/components/daily-input-recap-tabs";
import { DailyProductionRecapTable } from "@/features/production/components/daily-production-recap-table";
import { ProductionDateToolbar } from "@/features/production/components/production-date-toolbar";
import { parseDailyInputRecapTab } from "@/features/production/config/daily-input-recap-tabs";
import {
  getProductionTenantScope,
  requireManageProductionSession,
} from "@/features/production/lib/access";
import {
  formatProductionDateLabel,
  parseProductionRecordDate,
} from "@/features/production/lib/parse-production-date";
import { listDailyProductionRecap } from "@/features/production/services/list-daily-production-recap";

type ProductionPageProps = {
  searchParams: Promise<{
    date?: string;
    tab?: string;
  }>;
};

export default async function ProductionPage({ searchParams }: ProductionPageProps) {
  const session = await requireManageProductionSession();
  const { tenantId, needsTenantSelection } = getProductionTenantScope(session);
  const params = await searchParams;
  const recordDate = parseProductionRecordDate(params.date);
  const recordDateLabel = formatProductionDateLabel(recordDate);
  const activeTab = parseDailyInputRecapTab(params.tab);

  const productionRows =
    tenantId && !needsTenantSelection
      ? await listDailyProductionRecap(tenantId, recordDate)
      : [];

  return (
    <>
      <PageHeader
        title="Input harian"
        description={`Rekap input lapangan — ${recordDateLabel}. Data multi-record per kandang (pagi/sore).`}
      />
      {needsTenantSelection ? (
        <TenantRequiredPanel />
      ) : (
        <div className="flex flex-col gap-4">
          <Suspense fallback={null}>
            <ProductionDateToolbar />
          </Suspense>
          <Suspense fallback={null}>
            <DailyInputRecapTabs activeTab={activeTab} />
          </Suspense>

          {activeTab === "eggs" ? (
            <DailyProductionRecapTable
              rows={productionRows}
              recordDateLabel={recordDateLabel}
            />
          ) : null}

          {activeTab === "feed" ? (
            <DailyInputRecapEmptyPanel
              title="Belum ada rekap pakan"
              description="Data konsumsi pakan akan muncul setelah modul inventori dan API feed-consumption aktif."
            />
          ) : null}

          {activeTab === "population" ? (
            <DailyInputRecapEmptyPanel
              title="Belum ada rekap mutasi populasi"
              description="Data increase/decrease layer akan muncul setelah API mutasi populasi aktif."
            />
          ) : null}

          {activeTab === "medical" ? (
            <DailyInputRecapEmptyPanel
              title="Belum ada rekap pengobatan"
              description="Laporan pengobatan akan muncul setelah API medical record aktif."
            />
          ) : null}
        </div>
      )}
    </>
  );
}
