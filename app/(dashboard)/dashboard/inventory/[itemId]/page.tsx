import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { TenantRequiredPanel } from "@/features/master-data/components/tenant-required-panel";
import {
  getInventoryTenantScope,
  requireManageInventorySession,
} from "@/features/inventory/lib/access";
import { ItemDetailView } from "@/features/inventory/components/item-detail-view";
import { getItemDetail } from "@/features/inventory/services/get-item-detail";
import prisma from "@/lib/prisma";

type ItemDetailPageProps = {
  params: Promise<{ itemId: string }>;
};

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
  const session = await requireManageInventorySession();
  const { tenantId, needsTenantSelection } = getInventoryTenantScope(session);
  const { itemId } = await params;

  if (needsTenantSelection || !tenantId) {
    return (
      <>
        <PageHeader title="Inventori" description="Detail item." />
        <TenantRequiredPanel />
      </>
    );
  }

  const [item, locations] = await Promise.all([
    getItemDetail(tenantId, itemId),
    prisma.location.findMany({
      where: { tenant_id: tenantId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!item) {
    notFound();
  }

  return (
    <>
      <div className="mb-2">
        <Link
          href="/dashboard/inventory"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Kembali ke Inventori
        </Link>
      </div>
      <PageHeader
        title={item.name}
        description="Stok per lokasi, kartu stok, dan penyesuaian stok."
      />
      <ItemDetailView item={item} locations={locations} />
    </>
  );
}
