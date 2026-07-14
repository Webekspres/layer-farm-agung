import prisma from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { UserListItem, UsersListFilters } from "@/features/users/types";

type ListUsersParams = UsersListFilters & {
  scopedTenantId?: string | null;
  page?: number;
  pageSize?: number;
};

export type PaginatedUsersResult = {
  items: UserListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

function buildUserWhere({
  search,
  roleId,
  tenantId,
  status = "all",
  scopedTenantId,
}: Omit<ListUsersParams, "page" | "pageSize">): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = {};

  if (scopedTenantId) {
    where.tenant_id = scopedTenantId;
  } else if (tenantId === "global") {
    where.tenant_id = null;
  } else if (tenantId) {
    where.tenant_id = tenantId;
  }

  if (roleId) {
    where.role_id = roleId;
  }

  if (status === "active") {
    where.is_active = true;
  } else if (status === "inactive") {
    where.is_active = false;
  }

  const q = search?.trim();
  if (q) {
    where.OR = [
      { full_name: { contains: q, mode: "insensitive" } },
      { username: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }

  return where;
}

const userInclude = {
  role: { select: { id: true, name: true } },
  tenant: { select: { id: true, name: true } },
} as const satisfies Prisma.UserInclude;

type UserWithRelations = Prisma.UserGetPayload<{
  include: typeof userInclude;
}>;

function mapUserRows(rows: UserWithRelations[]): UserListItem[] {
  return rows.map((row) => ({
    id: row.id,
    fullName: row.full_name,
    username: row.username,
    email: row.email,
    isActive: row.is_active,
    roleId: row.role_id,
    roleName: row.role.name,
    tenantId: row.tenant_id,
    tenantName: row.tenant?.name ?? null,
    createdAt: row.created_at.toISOString(),
  }));
}

export async function listUsersPaginated({
  page = 1,
  pageSize = 10,
  ...filters
}: ListUsersParams): Promise<PaginatedUsersResult> {
  const where = buildUserWhere(filters);
  const total = await prisma.user.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const skip = (safePage - 1) * pageSize;

  const rows = await prisma.user.findMany({
    where,
    include: userInclude,
    orderBy: { created_at: "desc" },
    skip,
    take: pageSize,
  });

  return {
    items: mapUserRows(rows),
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}
