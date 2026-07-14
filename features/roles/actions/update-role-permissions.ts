"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requirePermission } from "@/features/auth/lib/require-permission";

const schema = z.object({
  roleId: z.coerce.number().int().positive(),
  permissionIds: z
    .string()
    .transform((v) => (v ? v.split(",").map(Number).filter(Boolean) : [])),
});

export type UpdateRolePermissionsState = {
  error?: string;
  success?: boolean;
};

export async function updateRolePermissionsAction(
  _prev: UpdateRolePermissionsState,
  formData: FormData,
): Promise<UpdateRolePermissionsState> {
  await requirePermission("manage_roles");

  const parsed = schema.safeParse({
    roleId: formData.get("roleId"),
    permissionIds: formData.get("permissionIds") ?? "",
  });

  if (!parsed.success) {
    return { error: "Data tidak valid." };
  }

  const { roleId, permissionIds } = parsed.data;

  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) {
    return { error: "Peran tidak ditemukan." };
  }

  if (role.name === "superadmin") {
    return { error: "Permission superadmin tidak dapat diubah dari UI." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({ where: { role_id: roleId } });
      if (permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: permissionIds.map((permission_id) => ({
            role_id: roleId,
            permission_id,
          })),
        });
      }
    });
  } catch {
    return { error: "Gagal menyimpan permission." };
  }

  revalidatePath("/dashboard/roles");
  return { success: true };
}
