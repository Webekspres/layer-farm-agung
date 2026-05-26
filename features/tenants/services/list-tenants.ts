import prisma from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type {
  TenantListItem,
  TenantsListFilters,
} from "@/features/tenants/types";

function buildTenantWhere({
  search,
  status = "all",
}: TenantsListFilters): Prisma.TenantWhereInput {
  const where: Prisma.TenantWhereInput = {};

  if (status === "active") {
    where.is_active = true;
  } else if (status === "inactive") {
    where.is_active = false;
  }

  const q = search?.trim();
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
    ];
  }

  return where;
}

export async function listTenants(
  filters: TenantsListFilters = {},
): Promise<TenantListItem[]> {
  const rows = await prisma.tenant.findMany({
    where: buildTenantWhere(filters),
    include: { _count: { select: { users: true } } },
    orderBy: { name: "asc" },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    isActive: row.is_active,
    userCount: row._count.users,
    createdAt: row.created_at.toISOString(),
  }));
}

export async function listActiveTenantsForSwitcher() {
  return prisma.tenant.findMany({
    where: { is_active: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}
