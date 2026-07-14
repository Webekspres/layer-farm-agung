import prisma from "@/lib/prisma";
import type { UserListItem } from "@/features/users/types";

export async function getUserById(
  userId: string,
  scopedTenantId?: string | null,
): Promise<UserListItem | null> {
  const row = await prisma.user.findFirst({
    where: {
      id: userId,
      ...(scopedTenantId ? { tenant_id: scopedTenantId } : {}),
    },
    include: {
      role: { select: { id: true, name: true } },
      tenant: { select: { id: true, name: true } },
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
    tenantId: row.tenant_id,
    tenantName: row.tenant?.name ?? null,
    createdAt: row.created_at.toISOString(),
  };
}
