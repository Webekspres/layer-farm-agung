import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TenantRequiredPanel } from "@/features/master-data/components/tenant-required-panel";
import {
  getInventoryTenantScope,
  requireManageInventorySession,
} from "@/features/inventory/lib/access";
import { InventoryManagement } from "@/features/inventory/components/inventory-management";
import { parseInventoryListFilters } from "@/features/inventory/lib/parse-filters";
import { listItems } from "@/features/inventory/services/list-items";
import { parsePage, parsePageSize } from "@/lib/pagination";

type InventoryPageProps = {
  searchParams: Promise<{
    q?: string;
    type?: string;
    page?: string;
    pageSize?: string;
  }>;
};

export default async function InventoryPage({
  searchParams,
}: InventoryPageProps) {
  const session = await requireManageInventorySession();
  const { tenantId, needsTenantSelection } = getInventoryTenantScope(session);
  const params = await searchParams;
  const filters = parseInventoryListFilters(params);
  const page = parsePage(params.page);
  const pageSize = parsePageSize(params.pageSize);

  const hasTenant = Boolean(tenantId && !needsTenantSelection);
  const result = hasTenant
    ? await listItems(tenantId!, { ...filters, page, pageSize })
    : { items: [], total: 0, page: 1, pageSize: 10, totalPages: 1 };

  return (
    <>
      <PageHeader
        title="Inventori"
        description="Master item (pakan, obat, vitamin, telur, lainnya) beserta stok per tenant. Klik item untuk melihat stok & kartu stok."
      />
      {needsTenantSelection ? (
        <TenantRequiredPanel />
      ) : (
        <Suspense fallback={null}>
          <InventoryManagement
            items={result.items}
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
