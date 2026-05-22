import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import {
  requireGlobalAdmin,
  requirePermission,
} from "@/features/auth/lib/require-permission";
import { SubdomainsManagement } from "@/features/subdomains/components/subdomains-management";
import { parseSubdomainListFilters } from "@/features/subdomains/lib/parse-filters";
import { listSubdomains } from "@/features/subdomains/services/list-subdomains";

type BranchesPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
  }>;
};

export default async function BranchesPage({ searchParams }: BranchesPageProps) {
  const session = await requirePermission("manage_roles");
  requireGlobalAdmin(session);

  const params = await searchParams;
  const filters = parseSubdomainListFilters(params);
  const subdomains = await listSubdomains(filters);

  return (
    <>
      <PageHeader
        title="Manajemen Cabang"
        description="Kelola cabang peternakan (subdomain). Superadmin dapat beralih konteks cabang dari header."
      />
      <Suspense fallback={null}>
        <SubdomainsManagement subdomains={subdomains} />
      </Suspense>
    </>
  );
}
