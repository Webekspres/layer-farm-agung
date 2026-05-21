import { PageHeader } from "@/components/layout/page-header";
import { ComingSoonPanel } from "@/features/dashboard/components/coming-soon-panel";

export default function RolesPage() {
  return (
    <>
      <PageHeader
        title="Peran & Akses"
        description="Atur role dan permission RBAC secara dinamis."
      />
      <ComingSoonPanel />
    </>
  );
}
