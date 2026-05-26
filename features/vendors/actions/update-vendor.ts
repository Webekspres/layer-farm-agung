"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
  getMasterDataTenantScope,
  requireManageMasterDataSession,
} from "@/features/master-data/lib/access";
import { updateVendorSchema } from "@/features/vendors/schemas/vendor";

export type VendorFormState = {
  error?: string;
  success?: boolean;
};

export async function updateVendorAction(
  _prev: VendorFormState,
  formData: FormData,
): Promise<VendorFormState> {
  const session = await requireManageMasterDataSession();
  const { tenantId, needsTenantSelection } = getMasterDataTenantScope(session);

  if (needsTenantSelection || !tenantId) {
    return { error: "Pilih tenant aktif terlebih dahulu." };
  }

  const parsed = updateVendorSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    category: formData.get("category"),
    address: formData.get("address"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const existing = await prisma.vendor.findFirst({
    where: { id: parsed.data.id, tenant_id: tenantId },
    select: { id: true },
  });

  if (!existing) {
    return { error: "Vendor tidak ditemukan." };
  }

  try {
    await prisma.vendor.update({
      where: { id: parsed.data.id },
      data: {
        name: parsed.data.name,
        category: parsed.data.category,
        address: parsed.data.address ?? null,
      },
    });
  } catch {
    return { error: "Gagal memperbarui vendor." };
  }

  revalidatePath("/dashboard/vendors");
  return { success: true };
}
