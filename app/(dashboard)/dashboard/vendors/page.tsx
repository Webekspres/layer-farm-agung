import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TenantRequiredPanel } from "@/features/master-data/components/tenant-required-panel";
import {
  getMasterDataTenantScope,
  requireManageMasterDataSession,
} from "@/features/master-data/lib/access";
import { VendorsManagement } from "@/features/vendors/components/vendors-management";
import { parseVendorListFilters } from "@/features/vendors/lib/parse-filters";
import { listVendors } from "@/features/vendors/services/list-vendors";

import { parsePage, parsePageSize } from "@/lib/pagination";

type VendorsPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    page?: string;
    pageSize?: string;
  }>;
};

export default async function VendorsPage({ searchParams }: VendorsPageProps) {
  const session = await requireManageMasterDataSession();
  const { tenantId, needsTenantSelection } = getMasterDataTenantScope(session);
  const params = await searchParams;
  const filters = parseVendorListFilters(params);
  const page = parsePage(params.page);
  const pageSize = parsePageSize(params.pageSize);

  const hasTenant = Boolean(tenantId && !needsTenantSelection);
  const result = hasTenant
    ? await listVendors(tenantId!, { ...filters, page, pageSize })
    : { items: [], total: 0, page: 1, pageSize: 10, totalPages: 1 };

  return (
    <>
      <PageHeader
        title="Vendor"
        description="Master pemasok per tenant (pakan, obat, perlengkapan). PO akan menyusul di modul procurement."
      />
      {needsTenantSelection ? (
        <TenantRequiredPanel />
      ) : (
        <Suspense fallback={null}>
          <VendorsManagement
            vendors={result.items}
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
