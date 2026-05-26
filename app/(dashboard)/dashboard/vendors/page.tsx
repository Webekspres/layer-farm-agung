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

type VendorsPageProps = {
  searchParams: Promise<{ q?: string; category?: string }>;
};

export default async function VendorsPage({ searchParams }: VendorsPageProps) {
  const session = await requireManageMasterDataSession();
  const { tenantId, needsTenantSelection } = getMasterDataTenantScope(session);
  const params = await searchParams;
  const filters = parseVendorListFilters(params);

  const vendors =
    tenantId && !needsTenantSelection
      ? await listVendors(tenantId, filters)
      : [];

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
          <VendorsManagement vendors={vendors} />
        </Suspense>
      )}
    </>
  );
}
