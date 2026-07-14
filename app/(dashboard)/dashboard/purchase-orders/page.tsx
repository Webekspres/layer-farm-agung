import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TenantRequiredPanel } from "@/features/master-data/components/tenant-required-panel";
import {
  getInventoryTenantScope,
  requireManageInventorySession,
} from "@/features/inventory/lib/access";
import { PurchaseOrdersManagement } from "@/features/procurement/components/purchase-orders-management";
import { getPurchaseOrderFormOptions } from "@/features/procurement/services/get-purchase-order-form-options";
import { listPurchaseOrders } from "@/features/procurement/services/list-purchase-orders";
import { parsePage, parsePageSize } from "@/lib/pagination";

type PurchaseOrdersPageProps = {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
  }>;
};

export default async function PurchaseOrdersPage({
  searchParams,
}: PurchaseOrdersPageProps) {
  const session = await requireManageInventorySession();
  const { tenantId, needsTenantSelection } = getInventoryTenantScope(session);
  const params = await searchParams;
  const page = parsePage(params.page);
  const pageSize = parsePageSize(params.pageSize);

  const hasTenant = Boolean(tenantId && !needsTenantSelection);
  const [result, formOptions] = hasTenant
    ? await Promise.all([
        listPurchaseOrders(tenantId!, { page, pageSize }),
        getPurchaseOrderFormOptions(tenantId!),
      ])
    : [
        { items: [], total: 0, page: 1, pageSize: 10, totalPages: 1 },
        { vendors: [], items: [], locations: [] },
      ];

  return (
    <>
      <PageHeader
        title="Pesanan pembelian"
        description="Catat pembelian ke supplier. Terima barang untuk menambah stok inventori (IN_PURCHASE)."
      />
      {needsTenantSelection ? (
        <TenantRequiredPanel />
      ) : (
        <Suspense fallback={null}>
          <PurchaseOrdersManagement
            orders={result.items}
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
