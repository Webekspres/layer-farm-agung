import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { UsersManagement } from "@/features/users/components/users-management";
import {
  getUsersTenantScope,
  requireManageUsersSession,
} from "@/features/users/lib/access";
import {
  parseUserPage,
  parseUserPageSize,
} from "@/features/users/lib/pagination";
import { getUserFormOptions } from "@/features/users/services/get-form-options";
import { listUsersPaginated } from "@/features/users/services/list-users";
import type { UsersListFilters } from "@/features/users/types";

type UsersPageProps = {
  searchParams: Promise<{
    q?: string;
    roleId?: string;
    tenantId?: string;
    status?: string;
    page?: string;
    pageSize?: string;
  }>;
};

function parseFilters(
  params: Awaited<UsersPageProps["searchParams"]>,
): UsersListFilters {
  const status = params.status;
  const validStatus =
    status === "active" || status === "inactive" || status === "all"
      ? status
      : "active";

  return {
    search: params.q,
    roleId: params.roleId ? Number(params.roleId) : undefined,
    tenantId: params.tenantId,
    status: validStatus,
  };
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const session = await requireManageUsersSession();
  const { isGlobalAdmin, scopedTenantId } = getUsersTenantScope(session);
  const params = await searchParams;
  const filters = parseFilters(params);
  const page = parseUserPage(params.page);
  const pageSize = parseUserPageSize(params.pageSize);

  const [result, formOptions] = await Promise.all([
    listUsersPaginated({
      ...filters,
      scopedTenantId,
      page,
      pageSize,
    }),
    getUserFormOptions(isGlobalAdmin, scopedTenantId),
  ]);

  return (
    <>
      <PageHeader
        title="Manajemen Pengguna"
        description="Kelola akun staff dan admin per tenant. Buat pengguna baru, filter daftar, dan aktifkan atau nonaktifkan akses login."
      />

      <Suspense fallback={null}>
        <UsersManagement
          users={result.items}
          formOptions={formOptions}
          currentUserId={session.user.id}
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
