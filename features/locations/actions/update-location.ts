"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
  getMasterDataTenantScope,
  requireManageMasterDataSession,
} from "@/features/master-data/lib/access";
import { updateLocationSchema } from "@/features/locations/schemas/location";

export type LocationFormState = {
  error?: string;
  success?: boolean;
};

export async function updateLocationAction(
  _prev: LocationFormState,
  formData: FormData,
): Promise<LocationFormState> {
  const session = await requireManageMasterDataSession();
  const { tenantId, needsTenantSelection } = getMasterDataTenantScope(session);

  if (needsTenantSelection || !tenantId) {
    return { error: "Pilih tenant aktif terlebih dahulu." };
  }

  const parsed = updateLocationSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const existing = await prisma.location.findFirst({
    where: { id: parsed.data.id, tenant_id: tenantId },
    select: { id: true },
  });

  if (!existing) {
    return { error: "Lokasi tidak ditemukan." };
  }

  try {
    await prisma.location.update({
      where: { id: parsed.data.id },
      data: { name: parsed.data.name },
    });
  } catch {
    return { error: "Gagal memperbarui lokasi." };
  }

  revalidatePath("/dashboard/locations");
  revalidatePath("/dashboard/cages");
  return { success: true };
}
