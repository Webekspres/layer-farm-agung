import { PageHeader } from "@/components/layout/page-header";
import { requirePermission } from "@/features/auth/lib/require-permission";
import { ComingSoonPanel } from "@/features/dashboard/components/coming-soon-panel";

export default async function FinancePage() {
  await requirePermission("view_cashflow");

  return (
    <>
      <PageHeader
        title="Keuangan"
        description="Arus kas, laporan, dan transaksi keuangan peternakan."
      />
      <ComingSoonPanel />
    </>
  );
}
