import { Suspense } from "react";
import { AlertCircle } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { TenantRequiredPanel } from "@/features/master-data/components/tenant-required-panel";
import { DailyInputRecapTabs } from "@/features/production/components/daily-input-recap-tabs";
import { DailyProductionRecapTable } from "@/features/production/components/daily-production-recap-table";
import { FeedConsumptionRecapTable } from "@/features/production/components/feed-consumption-recap-table";
import { PopulationMutationRecapTable } from "@/features/production/components/population-mutation-recap-table";
import { MedicalRecordRecapTable } from "@/features/production/components/medical-record-recap-table";
import { DailyInputRecapEmptyPanel } from "@/features/production/components/daily-input-recap-empty-panel";
import { CageStatusGrid } from "@/features/production/components/cage-status-grid";
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
import { listAdminCagesStatus } from "@/features/production/services/list-admin-cages-status";

type ProductionPageProps = {
  searchParams: Promise<{
    date?: string;
    tab?: string;
    cageId?: string;
    cageName?: string;
  }>;
};

export default async function ProductionPage({ searchParams }: ProductionPageProps) {
  const session = await requireManageProductionSession();
  const { tenantId, needsTenantSelection } = getProductionTenantScope(session);
  const params = await searchParams;
  const recordDate = parseProductionRecordDate(params.date);
  const recordDateLabel = formatProductionDateLabel(recordDate);
  const activeTab = parseDailyInputRecapTab(params.tab);
  const selectedCageId = params.cageId;

  const hasTenant = tenantId && !needsTenantSelection;

  const cageStatus = hasTenant
    ? await listAdminCagesStatus(tenantId, recordDate)
    : [];

  const selectedCage = selectedCageId
    ? cageStatus.find((cage) => cage.id === selectedCageId)
    : undefined;
  const selectedCageName = selectedCage?.name ?? params.cageName;

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

  const filteredProductionRows = selectedCageId
    ? productionRows.filter((row) => row.cageId === selectedCageId)
    : productionRows;

  const filteredFeedRows = selectedCageId
    ? feedRows.filter((row) => row.cageId === selectedCageId)
    : feedRows;

  const filteredPopulationRows = selectedCageId
    ? populationRows.filter((row) => row.cageId === selectedCageId)
    : populationRows;

  const filteredMedicalRows = selectedCageId
    ? medicalRows.filter((row) => row.cageId === selectedCageId)
    : medicalRows;

  return (
    <>
      <PageHeader
        title="Input harian"
        description={`Rekap input lapangan — ${recordDateLabel}. Data multi-record per kandang (pagi/sore).`}
      />
      {needsTenantSelection ? (
        <TenantRequiredPanel />
      ) : (
        <div className="flex flex-col gap-6">
          <Suspense fallback={null}>
            <ProductionDateToolbar />
          </Suspense>
          <CageStatusGrid
            cages={cageStatus}
            activeTab={activeTab}
            selectedCageId={selectedCageId}
          />
          <Suspense fallback={null}>
            <DailyInputRecapTabs activeTab={activeTab} />
          </Suspense>


          {selectedCageId ? (
            <div className="space-y-4">
              <div className="rounded-3xl border border-border bg-card p-6">
                <p className="text-sm font-semibold text-foreground">
                  Riwayat Transaksi Harian: {selectedCageName || "-"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Menampilkan catatan kronologis untuk kandang yang dipilih.
                </p>
              </div>

              {activeTab === "eggs" ? (
                <DailyProductionRecapTable
                  rows={filteredProductionRows}
                  recordDateLabel={recordDateLabel}
                />
              ) : null}

              {activeTab === "feed" ? (
                <FeedConsumptionRecapTable
                  rows={filteredFeedRows}
                  recordDateLabel={recordDateLabel}
                />
              ) : null}

              {activeTab === "population" ? (
                <PopulationMutationRecapTable
                  rows={filteredPopulationRows}
                  recordDateLabel={recordDateLabel}
                />
              ) : null}

              {activeTab === "medical" ? (
                <MedicalRecordRecapTable
                  rows={filteredMedicalRows}
                  recordDateLabel={recordDateLabel}
                />
              ) : null}
            </div>
          ) : (
            <DailyInputRecapEmptyPanel
              icon={
                <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
              }
              title="Pilih kandang untuk melihat riwayat harian"
              description="Klik salah satu kartu di atas untuk menampilkan log input kronologis berdasarkan kandang dan tab aktif."
            />
          )}
        </div>
      )}
    </>
  );
}

