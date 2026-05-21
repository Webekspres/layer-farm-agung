import { PageHeader } from "@/components/layout/page-header";
import { requirePermission } from "@/features/auth/lib/require-permission";
import { ComingSoonPanel } from "@/features/dashboard/components/coming-soon-panel";

export default async function InventoryPage() {
  await requirePermission("manage_inventory");

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
