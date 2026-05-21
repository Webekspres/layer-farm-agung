import { PageHeader } from "@/components/layout/page-header";
import {
  requireGlobalAdmin,
  requirePermission,
} from "@/features/auth/lib/require-permission";
import { SubdomainsManagement } from "@/features/subdomains/components/subdomains-management";
import { listSubdomains } from "@/features/subdomains/services/list-subdomains";

export default async function BranchesPage() {
  const session = await requirePermission("manage_roles");
  requireGlobalAdmin(session);

  const subdomains = await listSubdomains();

  return (
    <>
      <PageHeader
        title="Manajemen Cabang"
        description="Kelola cabang peternakan (subdomain). Superadmin dapat beralih konteks cabang dari header."
      />
      <SubdomainsManagement subdomains={subdomains} />
    </>
  );
}
