"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
  getMasterDataTenantScope,
  requireManageMasterDataSession,
} from "@/features/master-data/lib/access";

export type DeleteLocationState = {
  error?: string;
  success?: boolean;
};

export async function deleteLocationAction(
  _prev: DeleteLocationState,
  formData: FormData,
): Promise<DeleteLocationState> {
  const session = await requireManageMasterDataSession();
  const { tenantId, needsTenantSelection } = getMasterDataTenantScope(session);

  if (needsTenantSelection || !tenantId) {
    return { error: "Pilih tenant aktif terlebih dahulu." };
  }

  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { error: "ID lokasi tidak valid." };
  }

  const existing = await prisma.location.findFirst({
    where: { id, tenant_id: tenantId },
    include: { _count: { select: { cages: true } } },
  });

  if (!existing) {
    return { error: "Lokasi tidak ditemukan." };
  }

  if (existing._count.cages > 0) {
    return {
      error: "Lokasi masih memiliki kandang. Hapus atau pindahkan kandang terlebih dahulu.",
    };
  }

  try {
    await prisma.location.delete({ where: { id } });
  } catch {
    return { error: "Gagal menghapus lokasi." };
  }

  revalidatePath("/dashboard/locations");
  return { success: true };
}
