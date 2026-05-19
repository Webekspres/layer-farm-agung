import prisma from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { UserListItem, UsersListFilters } from "@/features/users/types";

type ListUsersParams = UsersListFilters & {
  scopedSubdomainId?: string | null;
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
  subdomainId,
  status = "all",
  scopedSubdomainId,
}: Omit<ListUsersParams, "page" | "pageSize">): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = {};

  if (scopedSubdomainId) {
    where.subdomain_id = scopedSubdomainId;
  } else if (subdomainId === "global") {
    where.subdomain_id = null;
  } else if (subdomainId) {
    where.subdomain_id = subdomainId;
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
  subdomain: { select: { id: true, name: true } },
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
    subdomainId: row.subdomain_id,
    subdomainName: row.subdomain?.name ?? null,
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
