import { PageHeader } from "@/components/layout/page-header";
import { ComingSoonPanel } from "@/features/dashboard/components/coming-soon-panel";

export default function InventoryPage() {
  return (
    <>
      <PageHeader
        title="Inventori"
        description="Stok pakan, obat, dan mutasi persediaan per cabang."
      />
      <ComingSoonPanel />
    </>
  );
}
