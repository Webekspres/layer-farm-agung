import { Suspense } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { TenantRequiredPanel } from "@/features/master-data/components/tenant-required-panel";
import { DailyProductionRecapTable } from "@/features/production/components/daily-production-recap-table";
import { ProductionDateToolbar } from "@/features/production/components/production-date-toolbar";
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
  }>;
};

export default async function ProductionPage({ searchParams }: ProductionPageProps) {
  const session = await requireManageProductionSession();
  const { tenantId, needsTenantSelection } = getProductionTenantScope(session);
  const params = await searchParams;
  const recordDate = parseProductionRecordDate(params.date);
  const recordDateLabel = formatProductionDateLabel(recordDate);

  const rows =
    tenantId && !needsTenantSelection
      ? await listDailyProductionRecap(tenantId, recordDate)
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
        <div className="flex flex-col gap-4">
          <Suspense fallback={null}>
            <ProductionDateToolbar />
          </Suspense>
          <DailyProductionRecapTable
            rows={rows}
            recordDateLabel={recordDateLabel}
          />
        </div>
      )}
    </>
  );
}
