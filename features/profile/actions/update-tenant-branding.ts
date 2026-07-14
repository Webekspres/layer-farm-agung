"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/features/auth/lib/session";
import { z } from "zod";

export type UpdateTenantBrandingState = {
  error?: string;
  success?: boolean;
};

const updateTenantBrandingSchema = z.object({
  brandName: z
    .string()
    .trim()
    .max(100, "Nama brand maksimal 100 karakter.")
    .or(z.literal("")),
});

export async function updateTenantBrandingAction(
  _prev: UpdateTenantBrandingState,
  formData: FormData,
): Promise<UpdateTenantBrandingState> {
  const session = await getServerSession();
  if (!session) {
    return { error: "Sesi tidak ditemukan." };
  }

  const isGlobalAdmin = session.user.tenantId === null;
  const isTenantAdmin = session.user.roleName === "admin";

  if (isGlobalAdmin || !isTenantAdmin) {
    return { error: "Anda tidak memiliki akses untuk mengubah kustomisasi brand." };
  }

  const parsed = updateTenantBrandingSchema.safeParse({
    brandName: formData.get("brandName"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Data tidak valid.",
    };
  }

  try {
    await prisma.tenant.update({
      where: { id: session.user.tenantId! },
      data: {
        brand_name: parsed.data.brandName || null,
      },
    });
  } catch {
    return { error: "Gagal menyimpan konfigurasi branding." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");
  return { success: true };
}
