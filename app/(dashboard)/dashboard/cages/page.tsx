import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TenantRequiredPanel } from "@/features/master-data/components/tenant-required-panel";
import {
  getMasterDataTenantScope,
  requireManageMasterDataSession,
} from "@/features/master-data/lib/access";
import { CagesManagement } from "@/features/cages/components/cages-management";
import { parseCageListFilters } from "@/features/cages/lib/parse-filters";
import { getCageFormOptions } from "@/features/cages/services/get-cage-form-options";
import { listCages } from "@/features/cages/services/list-cages";
import { listStrainOptions } from "@/features/strains/services/list-strains";

import { parsePage, parsePageSize } from "@/lib/pagination";

type CagesPageProps = {
  searchParams: Promise<{
    q?: string;
    location?: string;
    strain?: string;
    status?: string;
    page?: string;
    pageSize?: string;
  }>;
};

export default async function CagesPage({ searchParams }: CagesPageProps) {
  const session = await requireManageMasterDataSession();
  const { tenantId, needsTenantSelection } = getMasterDataTenantScope(session);
  const params = await searchParams;
  const filters = parseCageListFilters(params);
  const page = parsePage(params.page);
  const pageSize = parsePageSize(params.pageSize);

  const hasTenant = Boolean(tenantId && !needsTenantSelection);
  const result = hasTenant
    ? await listCages(tenantId!, { ...filters, page, pageSize })
    : { items: [], total: 0, page: 1, pageSize: 10, totalPages: 1 };

  const formOptions = hasTenant
    ? await getCageFormOptions(tenantId!)
    : { locations: [], strains: await listStrainOptions() };

  return (
    <>
      <PageHeader
        title="Kandang"
        description="Kelola kandang per lokasi, strain, kapasitas, dan siklus awal."
      />
      {needsTenantSelection ? (
        <TenantRequiredPanel />
      ) : (
        <Suspense fallback={null}>
          <CagesManagement
            cages={result.items}
            formOptions={formOptions}
            pagination={{
              page: result.page,
              pageSize: result.pageSize,
              total: result.total,
              totalPages: result.totalPages,
            }}
          />
        </Suspense>
      )}
    </>
  );
}
