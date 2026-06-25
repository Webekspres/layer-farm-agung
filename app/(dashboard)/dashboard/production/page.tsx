import { Suspense } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { TenantRequiredPanel } from "@/features/master-data/components/tenant-required-panel";
import { DailyInputRecapTabs } from "@/features/production/components/daily-input-recap-tabs";
import { DailyProductionRecapTable } from "@/features/production/components/daily-production-recap-table";
import { FeedConsumptionRecapTable } from "@/features/production/components/feed-consumption-recap-table";
import { PopulationMutationRecapTable } from "@/features/production/components/population-mutation-recap-table";
import { MedicalRecordRecapTable } from "@/features/production/components/medical-record-recap-table";
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
import { listFeedConsumptionRecap } from "@/features/production/services/list-feed-consumption-recap";
import { listPopulationMutationRecap } from "@/features/production/services/list-population-mutation-recap";
import { listMedicalRecordRecap } from "@/features/production/services/list-medical-record-recap";

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

  const hasTenant = tenantId && !needsTenantSelection;

  const productionRows = hasTenant
    ? await listDailyProductionRecap(tenantId, recordDate)
    : [];

  const feedRows = hasTenant && activeTab === "feed"
    ? await listFeedConsumptionRecap(tenantId, recordDate)
    : [];

  const populationRows = hasTenant && activeTab === "population"
    ? await listPopulationMutationRecap(tenantId, recordDate)
    : [];

  const medicalRows = hasTenant && activeTab === "medical"
    ? await listMedicalRecordRecap(tenantId, recordDate)
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
            <FeedConsumptionRecapTable
              rows={feedRows}
              recordDateLabel={recordDateLabel}
            />
          ) : null}

          {activeTab === "population" ? (
            <PopulationMutationRecapTable
              rows={populationRows}
              recordDateLabel={recordDateLabel}
            />
          ) : null}

          {activeTab === "medical" ? (
            <MedicalRecordRecapTable
              rows={medicalRows}
              recordDateLabel={recordDateLabel}
            />
          ) : null}
        </div>
      )}
    </>
  );
}

