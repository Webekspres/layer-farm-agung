import { PageHeader } from "@/components/layout/page-header";
import { ComingSoonPanel } from "@/features/dashboard/components/coming-soon-panel";

export default function FinancePage() {
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
