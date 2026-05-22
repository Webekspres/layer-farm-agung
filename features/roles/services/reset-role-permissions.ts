import prisma from "@/lib/prisma";
import {
  getDefaultPermissionNamesForRole,
  SUPERADMIN_ROLE_NAME,
} from "@/features/roles/config/system-roles";

export type ResetRolePermissionsResult =
  | { ok: true }
  | { ok: false; error: string };

export async function resetRolePermissionsToDefaults(
  roleId: number,
): Promise<ResetRolePermissionsResult> {
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) {
    return { ok: false, error: "Peran tidak ditemukan." };
  }

  if (role.name === SUPERADMIN_ROLE_NAME) {
    return {
      ok: false,
      error: "Permission superadmin tidak dapat diubah dari UI.",
    };
  }

  const defaultNames = getDefaultPermissionNamesForRole(role.name);
  if (!defaultNames) {
    return {
      ok: false,
      error: "Peran ini tidak memiliki permission default sistem.",
    };
  }

  const permissionRows = await prisma.permission.findMany({
    where: { name: { in: [...defaultNames] } },
    select: { id: true },
  });

  try {
    await prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({ where: { role_id: roleId } });
      if (permissionRows.length > 0) {
        await tx.rolePermission.createMany({
          data: permissionRows.map((row) => ({
            role_id: roleId,
            permission_id: row.id,
          })),
        });
      }
    });
  } catch {
    return { ok: false, error: "Gagal mengembalikan permission ke default." };
  }

  return { ok: true };
}
