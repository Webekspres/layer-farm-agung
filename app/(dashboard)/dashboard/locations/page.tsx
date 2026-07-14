import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TenantRequiredPanel } from "@/features/master-data/components/tenant-required-panel";
import {
  getMasterDataTenantScope,
  requireManageMasterDataSession,
} from "@/features/master-data/lib/access";
import { LocationsManagement } from "@/features/locations/components/locations-management";
import { parseLocationListFilters } from "@/features/locations/lib/parse-filters";
import { listLocations } from "@/features/locations/services/list-locations";

import { parsePage, parsePageSize } from "@/lib/pagination";

type LocationsPageProps = {
  searchParams: Promise<{
    q?: string;
    occupancy?: string;
    page?: string;
    pageSize?: string;
  }>;
};

export default async function LocationsPage({
  searchParams,
}: LocationsPageProps) {
  const session = await requireManageMasterDataSession();
  const { tenantId, needsTenantSelection } = getMasterDataTenantScope(session);
  const params = await searchParams;
  const filters = parseLocationListFilters(params);
  const page = parsePage(params.page);
  const pageSize = parsePageSize(params.pageSize);

  const hasTenant = Boolean(tenantId && !needsTenantSelection);
  const result = hasTenant
    ? await listLocations(tenantId!, { ...filters, page, pageSize })
    : { items: [], total: 0, page: 1, pageSize: 10, totalPages: 1 };

  return (
    <>
      <PageHeader
        title="Lokasi"
        description="Kelola lokasi peternakan per tenant (area/kawasan kandang)."
      />
      {needsTenantSelection ? (
        <TenantRequiredPanel />
      ) : (
        <Suspense fallback={null}>
          <LocationsManagement
            locations={result.items}
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
