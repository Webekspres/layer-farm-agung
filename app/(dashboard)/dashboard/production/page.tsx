import { PageHeader } from "@/components/layout/page-header";
import { requirePermission } from "@/features/auth/lib/require-permission";
import { ComingSoonPanel } from "@/features/dashboard/components/coming-soon-panel";

export default async function ProductionPage() {
  await requirePermission("manage_production");

  return (
    <>
      <PageHeader
        title="Produksi"
        description="Rekap produksi telur harian dan monitoring kandang. Input lapangan ditangani aplikasi mobile (React Native + Expo)."
      />
      <ComingSoonPanel />
    </>
  );
}
