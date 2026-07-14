import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TenantRequiredPanel } from "@/features/master-data/components/tenant-required-panel";
import {
  getInventoryTenantScope,
  requireManageInventorySession,
} from "@/features/inventory/lib/access";
import { StockMutationsManagement } from "@/features/inventory/components/stock-mutations-management";
import { parseStockMutationListFilters } from "@/features/inventory/lib/parse-stock-mutation-filters";
import { listStockMutations } from "@/features/inventory/services/list-stock-mutations";
import { listLocationOptions } from "@/features/locations/services/list-locations";
import { parsePage, parsePageSize } from "@/lib/pagination";

type StockMutationsPageProps = {
  searchParams: Promise<{
    q?: string;
    type?: string;
    location?: string;
    from?: string;
    to?: string;
    page?: string;
    pageSize?: string;
  }>;
};

export default async function StockMutationsPage({
  searchParams,
}: StockMutationsPageProps) {
  const session = await requireManageInventorySession();
  const { tenantId, needsTenantSelection } = getInventoryTenantScope(session);
  const params = await searchParams;
  const filters = parseStockMutationListFilters(params);
  const page = parsePage(params.page);
  const pageSize = parsePageSize(params.pageSize);

  const hasTenant = Boolean(tenantId && !needsTenantSelection);
  const [result, locations] = hasTenant
    ? await Promise.all([
        listStockMutations(tenantId!, { ...filters, page, pageSize }),
        listLocationOptions(tenantId!),
      ])
    : [
        { items: [], total: 0, page: 1, pageSize: 10, totalPages: 1 },
        [],
      ];

  return (
    <>
      <PageHeader
        title="Mutasi stok"
        description="Ledger bersama: saprodi (pakan/obat/vaksin) serta panen/penjualan telur (IN_HARVEST / OUT_SALES). Katalog item inventori tetap saprodi saja."
      />
      {needsTenantSelection ? (
        <TenantRequiredPanel />
      ) : (
        <Suspense fallback={null}>
          <StockMutationsManagement
            mutations={result.items}
            pagination={{
              page: result.page,
              pageSize: result.pageSize,
              total: result.total,
              totalPages: result.totalPages,
            }}
            locations={locations}
          />
        </Suspense>
      )}
    </>
  );
}
