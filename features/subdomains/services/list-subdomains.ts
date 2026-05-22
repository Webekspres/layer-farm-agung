import prisma from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type {
  SubdomainListItem,
  SubdomainsListFilters,
} from "@/features/subdomains/types";

function buildSubdomainWhere({
  search,
  status = "all",
}: SubdomainsListFilters): Prisma.SubdomainWhereInput {
  const where: Prisma.SubdomainWhereInput = {};

  if (status === "active") {
    where.is_active = true;
  } else if (status === "inactive") {
    where.is_active = false;
  }

  const q = search?.trim();
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { subdomain_url: { contains: q, mode: "insensitive" } },
    ];
  }

  return where;
}

export async function listSubdomains(
  filters: SubdomainsListFilters = {},
): Promise<SubdomainListItem[]> {
  const rows = await prisma.subdomain.findMany({
    where: buildSubdomainWhere(filters),
    include: { _count: { select: { users: true } } },
    orderBy: { name: "asc" },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    subdomainUrl: row.subdomain_url,
    isActive: row.is_active,
    userCount: row._count.users,
    createdAt: row.created_at.toISOString(),
  }));
}

export async function listActiveSubdomainsForSwitcher() {
  return prisma.subdomain.findMany({
    where: { is_active: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}
