"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
  requireGlobalAdmin,
  requirePermission,
} from "@/features/auth/lib/require-permission";
import { isWiredPermission } from "@/features/permissions/config/wired-permissions";
import { deletePermissionSchema } from "@/features/permissions/schemas/permission";

export type DeletePermissionState = {
  error?: string;
  success?: boolean;
};

export async function deletePermissionAction(
  permissionId: number,
): Promise<DeletePermissionState> {
  const session = await requirePermission("manage_roles");
  requireGlobalAdmin(session);

  const parsed = deletePermissionSchema.safeParse({ permissionId });
  if (!parsed.success) {
    return { error: "Data tidak valid." };
  }

  const permission = await prisma.permission.findUnique({
    where: { id: parsed.data.permissionId },
    include: { _count: { select: { role_permissions: true } } },
  });

  if (!permission) {
    return { error: "Permission tidak ditemukan." };
  }

  if (isWiredPermission(permission.name)) {
    return {
      error:
        "Permission ini terhubung ke fitur aplikasi dan tidak dapat dihapus dari UI.",
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({
        where: { permission_id: permission.id },
      });
      await tx.permission.delete({ where: { id: permission.id } });
    });
  } catch {
    return { error: "Gagal menghapus permission." };
  }

  revalidatePath("/dashboard/roles");
  return { success: true };
}
