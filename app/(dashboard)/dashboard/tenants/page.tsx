import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import {
  requireGlobalAdmin,
  requirePermission,
} from "@/features/auth/lib/require-permission";
import { TenantsManagement } from "@/features/tenants/components/tenants-management";
import { parseTenantListFilters } from "@/features/tenants/lib/parse-filters";
import { listTenants } from "@/features/tenants/services/list-tenants";

import { parsePage, parsePageSize } from "@/lib/pagination";

type TenantsPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
    pageSize?: string;
  }>;
};

export default async function TenantsPage({ searchParams }: TenantsPageProps) {
  const session = await requirePermission("manage_roles");
  requireGlobalAdmin(session);

  const params = await searchParams;
  const filters = parseTenantListFilters(params);
  const page = parsePage(params.page);
  const pageSize = parsePageSize(params.pageSize);

  const result = await listTenants({
    ...filters,
    page,
    pageSize,
  });

  return (
    <>
      <PageHeader
        title="Manajemen Tenant"
        description="Kelola tenant peternakan. Superadmin dapat beralih konteks tenant dari header."
      />
      <Suspense fallback={null}>
        <TenantsManagement
          tenants={result.items}
          pagination={{
            page: result.page,
            pageSize: result.pageSize,
            total: result.total,
            totalPages: result.totalPages,
          }}
        />
      </Suspense>
    </>
  );
}
