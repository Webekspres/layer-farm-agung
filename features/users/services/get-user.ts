import prisma from "@/lib/prisma";
import type { UserListItem } from "@/features/users/types";

export async function getUserById(
  userId: string,
  scopedSubdomainId?: string | null,
): Promise<UserListItem | null> {
  const row = await prisma.user.findFirst({
    where: {
      id: userId,
      ...(scopedSubdomainId ? { subdomain_id: scopedSubdomainId } : {}),
    },
    include: {
      role: { select: { id: true, name: true } },
      subdomain: { select: { id: true, name: true } },
    },
  });

  if (!row) return null;

  return {
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
  };
}
