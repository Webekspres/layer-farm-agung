import prisma from "@/lib/prisma";
import { sortRolesBySystemOrder } from "@/features/roles/config/system-roles";
import type { PermissionItem, RoleWithPermissions } from "@/features/roles/types";

export async function listRolesWithPermissions(): Promise<{
  roles: RoleWithPermissions[];
  permissions: PermissionItem[];
}> {
  const [roles, permissions] = await Promise.all([
    prisma.role.findMany({
      include: {
        role_permissions: { select: { permission_id: true } },
        _count: { select: { users: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.permission.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const mapped = roles.map((role) => ({
    id: role.id,
    name: role.name,
    description: role.description,
    userCount: role._count.users,
    permissionIds: role.role_permissions.map((rp) => rp.permission_id),
  }));

  return {
    roles: sortRolesBySystemOrder(mapped),
    permissions,
  };
}
