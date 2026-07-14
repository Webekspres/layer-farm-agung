import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TenantRequiredPanel } from "@/features/master-data/components/tenant-required-panel";
import {
  getVaccinationTenantScope,
  requireManageVaccinationSession,
} from "@/features/health/lib/access";
import { VaccineSchedulesManagement } from "@/features/health/components/vaccine-schedules-management";
import { parseVaccineScheduleListFilters } from "@/features/health/lib/parse-filters";
import { getVaccineScheduleFormOptions } from "@/features/health/services/get-vaccine-schedule-form-options";
import { listVaccineSchedules } from "@/features/health/services/list-vaccine-schedules";
import { parsePage, parsePageSize } from "@/lib/pagination";

type VaccinesPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
    pageSize?: string;
  }>;
};

export default async function VaccinesPage({
  searchParams,
}: VaccinesPageProps) {
  const session = await requireManageVaccinationSession();
  const { tenantId, needsTenantSelection } = getVaccinationTenantScope(session);
  const params = await searchParams;
  const filters = parseVaccineScheduleListFilters(params);
  const page = parsePage(params.page);
  const pageSize = parsePageSize(params.pageSize);

  const hasTenant = Boolean(tenantId && !needsTenantSelection);
  const [result, formOptions] = hasTenant
    ? await Promise.all([
        listVaccineSchedules(tenantId!, { ...filters, page, pageSize }),
        getVaccineScheduleFormOptions(tenantId!),
      ])
    : [
        { items: [], total: 0, page: 1, pageSize: 10, totalPages: 1 },
        { cages: [], vaccineItems: [] },
      ];

  return (
    <>
      <PageHeader
        title="Vaksinasi"
        description="Jadwalkan vaksinasi per kandang dan catat pelaksanaannya. Stok vaksin terpotong otomatis (OUT_VACCINE) saat diselesaikan."
      />
      {needsTenantSelection ? (
        <TenantRequiredPanel />
      ) : (
        <Suspense fallback={null}>
          <VaccineSchedulesManagement
            schedules={result.items}
            pagination={{
              page: result.page,
              pageSize: result.pageSize,
              total: result.total,
              totalPages: result.totalPages,
            }}
            formOptions={formOptions}
          />
        </Suspense>
      )}
    </>
  );
}
