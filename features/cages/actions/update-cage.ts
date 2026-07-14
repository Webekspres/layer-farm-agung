"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
  getMasterDataTenantScope,
  requireManageMasterDataSession,
} from "@/features/master-data/lib/access";
import { updateCageSchema } from "@/features/cages/schemas/cage";

export type CageFormState = {
  error?: string;
  success?: boolean;
};

export async function updateCageAction(
  _prev: CageFormState,
  formData: FormData,
): Promise<CageFormState> {
  const session = await requireManageMasterDataSession();
  const { tenantId, needsTenantSelection } = getMasterDataTenantScope(session);

  if (needsTenantSelection || !tenantId) {
    return { error: "Pilih tenant aktif terlebih dahulu." };
  }

  const parsed = updateCageSchema.safeParse({
    id: formData.get("id"),
    locationId: formData.get("locationId"),
    strainId: formData.get("strainId"),
    name: formData.get("name"),
    cageType: formData.get("cageType"),
    cageTypeCustom: formData.get("cageTypeCustom"),
    capacity: formData.get("capacity"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const data = parsed.data;

  const existing = await prisma.cage.findFirst({
    where: {
      id: data.id,
      location: { tenant_id: tenantId },
    },
    select: { id: true },
  });

  if (!existing) {
    return { error: "Kandang tidak ditemukan." };
  }

  const location = await prisma.location.findFirst({
    where: { id: data.locationId, tenant_id: tenantId },
    select: { id: true },
  });

  if (!location) {
    return { error: "Lokasi tidak valid untuk tenant ini." };
  }

  // 🔒 TAMBAHAN VALIDASI: Cek benturan nama kandang lain di lokasi yang sama (Case-Insensitive)
  const duplicateCage = await prisma.cage.findFirst({
    where: {
      name: {
        equals: data.name,
        mode: "insensitive",
      },
      location_id: data.locationId,
      id: {
        not: data.id, // 👈 KUNCI: Kecualikan kandang ini sendiri agar bisa save jika nama tidak diubah
      },
    },
    select: { id: true },
  });

  if (duplicateCage) {
    return {
      error: `Nama kandang "${data.name}" sudah digunakan di lokasi ini.`,
    };
  }

  const finalCageType =
    data.cageType === "Lainnya" ? data.cageTypeCustom : data.cageType;

  try {
    await prisma.cage.update({
      where: { id: data.id },
      data: {
        location_id: data.locationId,
        strain_id: data.strainId,
        name: data.name,
        cage_type: finalCageType || null,
        capacity: data.capacity,
        status: data.status,
      },
    });
  } catch {
    return { error: "Gagal memperbarui kandang." };
  }

  revalidatePath("/dashboard/cages");
  return { success: true };
}
