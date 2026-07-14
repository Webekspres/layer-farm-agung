import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TenantRequiredPanel } from "@/features/master-data/components/tenant-required-panel";
import {
  getMasterDataTenantScope,
  requireManageMasterDataSession,
} from "@/features/master-data/lib/access";
import { CageDetailView } from "@/features/cages/components/cage-detail-view";
import { getCageDetail } from "@/features/cages/services/get-cage-detail";
import { listTenantStaffOptions } from "@/features/cages/services/list-tenant-staff-options";

type CageDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CageDetailPage({ params }: CageDetailPageProps) {
  const session = await requireManageMasterDataSession();
  const { tenantId, needsTenantSelection } = getMasterDataTenantScope(session);

  if (needsTenantSelection) {
    return (
      <>
        <PageHeader
          title="Detail Kandang"
          description="Lihat statistik detail dan kelola siklus kandang."
        />
        <TenantRequiredPanel />
      </>
    );
  }

  const { id } = await params;
  const [cage, staffOptions] = await Promise.all([
    getCageDetail(id, tenantId!),
    listTenantStaffOptions(tenantId!),
  ]);

  if (!cage) {
    notFound();
  }

  return (
    <Suspense fallback={null}>
      <CageDetailView cage={cage} staffOptions={staffOptions} />
    </Suspense>
  );
}
