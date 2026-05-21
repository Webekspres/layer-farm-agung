import prisma from "@/lib/prisma";
import type { SubdomainListItem } from "@/features/subdomains/types";

export async function listSubdomains(): Promise<SubdomainListItem[]> {
  const rows = await prisma.subdomain.findMany({
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
