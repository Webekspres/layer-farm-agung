import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { TenantRequiredPanel } from "@/features/master-data/components/tenant-required-panel";
import {
  getInventoryTenantScope,
  requireManageInventorySession,
} from "@/features/inventory/lib/access";
import { PurchaseOrderDetailView } from "@/features/procurement/components/purchase-order-detail-view";
import { getPurchaseOrder } from "@/features/procurement/services/get-purchase-order";
import { getPurchaseOrderFormOptions } from "@/features/procurement/services/get-purchase-order-form-options";

type PurchaseOrderDetailPageProps = {
  params: Promise<{ poId: string }>;
};

export default async function PurchaseOrderDetailPage({
  params,
}: PurchaseOrderDetailPageProps) {
  const session = await requireManageInventorySession();
  const { tenantId, needsTenantSelection } = getInventoryTenantScope(session);
  const { poId } = await params;

  if (needsTenantSelection || !tenantId) {
    return (
      <>
        <PageHeader title="Detail pesanan" description="Pesanan pembelian." />
        <TenantRequiredPanel />
      </>
    );
  }

  const order = await getPurchaseOrder(tenantId, poId);

  if (!order) {
    notFound();
  }

  const formOptions = await getPurchaseOrderFormOptions(tenantId);

  return (
    <>
      <PageHeader
        title="Detail pesanan pembelian"
        description={`PO ${order.vendorName} — ${order.orderDate}`}
      />
      <PurchaseOrderDetailView
        order={order}
        formOptions={{ locations: formOptions.locations }}
      />
    </>
  );
}
