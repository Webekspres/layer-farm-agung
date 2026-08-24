import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { TenantRequiredPanel } from "@/features/master-data/components/tenant-required-panel";
import {
  getInventoryTenantScope,
  requireManageInventorySession,
} from "@/features/inventory/lib/access";
import { EggStockDetailView } from "@/features/eggs/components/egg-stock-detail-view";
import { getEggStockGradeDetail } from "@/features/eggs/services/get-egg-stock-detail";

type EggStockDetailPageProps = {
  params: Promise<{ gradeId: string }>;
};

export default async function EggStockDetailPage({
  params,
}: EggStockDetailPageProps) {
  const session = await requireManageInventorySession();
  const { tenantId, needsTenantSelection } = getInventoryTenantScope(session);
  const { gradeId } = await params;

  const gradeIdNumber = Number(gradeId);
  if (!Number.isInteger(gradeIdNumber) || gradeIdNumber <= 0) {
    notFound();
  }

  if (needsTenantSelection || !tenantId) {
    return (
      <>
        <PageHeader title="Stok telur" description="Kartu stok grade telur." />
        <TenantRequiredPanel />
      </>
    );
  }

  const detail = await getEggStockGradeDetail(tenantId, gradeIdNumber);

  if (!detail) {
    notFound();
  }

  return (
    <>
      <div className="mb-2">
        <Link
          href="/dashboard/inventory?view=eggs"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Kembali ke Stok Telur
        </Link>
      </div>
      <PageHeader
        title={`${detail.name} (${detail.code ?? "—"})`}
        description={`Stok per lokasi dan kartu stok. Total: ${detail.totalQuantity.toLocaleString("id-ID")} butir.`}
      />
      <EggStockDetailView detail={detail} />
    </>
  );
}