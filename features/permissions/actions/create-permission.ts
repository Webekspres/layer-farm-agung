"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
  requireGlobalAdmin,
  requirePermission,
} from "@/features/auth/lib/require-permission";
import { createPermissionSchema } from "@/features/permissions/schemas/permission";

export type CreatePermissionState = {
  error?: string;
  success?: boolean;
};

export async function createPermissionAction(
  _prev: CreatePermissionState,
  formData: FormData,
): Promise<CreatePermissionState> {
  const session = await requirePermission("manage_roles");
  requireGlobalAdmin(session);

  const parsed = createPermissionSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Data tidak valid.",
    };
  }

  const existing = await prisma.permission.findUnique({
    where: { name: parsed.data.name },
  });

  if (existing) {
    return { error: "Permission dengan nama itu sudah ada." };
  }

  try {
    await prisma.permission.create({ data: { name: parsed.data.name } });
  } catch {
    return { error: "Gagal menambah permission." };
  }

  revalidatePath("/dashboard/roles");
  return { success: true };
}
