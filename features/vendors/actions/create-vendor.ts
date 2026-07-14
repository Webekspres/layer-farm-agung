"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
  getMasterDataTenantScope,
  requireManageMasterDataSession,
} from "@/features/master-data/lib/access";
import { vendorSchema } from "@/features/vendors/schemas/vendor";

export type VendorFormState = {
  error?: string;
  success?: boolean;
};

export async function createVendorAction(
  _prev: VendorFormState,
  formData: FormData,
): Promise<VendorFormState> {
  const session = await requireManageMasterDataSession();
  const { tenantId, needsTenantSelection } = getMasterDataTenantScope(session);

  if (needsTenantSelection || !tenantId) {
    return { error: "Pilih tenant aktif terlebih dahulu." };
  }

  const parsed = vendorSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    address: formData.get("address"),
    picName: formData.get("picName") || undefined,
    picPhone: formData.get("picPhone") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const vendor = await tx.vendor.create({
        data: {
          tenant_id: tenantId,
          name: parsed.data.name,
          category: parsed.data.category,
          address: parsed.data.address ?? null,
        },
      });

      if (parsed.data.picName?.trim()) {
        await tx.supplierContact.create({
          data: {
            vendor_id: vendor.id,
            pic_name: parsed.data.picName,
            phone: parsed.data.picPhone ?? "",
          },
        });
      }
    });
  } catch {
    return { error: "Gagal membuat vendor." };
  }

  revalidatePath("/dashboard/vendors");
  return { success: true };
}
