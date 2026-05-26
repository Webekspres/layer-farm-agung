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

type CagesPageProps = {
  searchParams: Promise<{
    q?: string;
    location?: string;
    strain?: string;
    status?: string;
  }>;
};

export default async function CagesPage({ searchParams }: CagesPageProps) {
  const session = await requireManageMasterDataSession();
  const { tenantId, needsTenantSelection } = getMasterDataTenantScope(session);
  const params = await searchParams;
  const filters = parseCageListFilters(params);

  const hasTenant = Boolean(tenantId && !needsTenantSelection);
  const cages = hasTenant ? await listCages(tenantId!, filters) : [];
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
          <CagesManagement cages={cages} formOptions={formOptions} />
        </Suspense>
      )}
    </>
  );
}
