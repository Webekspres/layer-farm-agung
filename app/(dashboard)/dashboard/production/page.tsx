import { PageHeader } from "@/components/layout/page-header";
import { ComingSoonPanel } from "@/features/dashboard/components/coming-soon-panel";

export default function ProductionPage() {
  return (
    <>
      <PageHeader
        title="Produksi"
        description="Pencatatan produksi telur harian dan monitoring kandang."
      />
      <ComingSoonPanel />
    </>
  );
}
