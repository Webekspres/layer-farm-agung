"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
  getMasterDataTenantScope,
  requireManageMasterDataSession,
} from "@/features/master-data/lib/access";
import { locationSchema } from "@/features/locations/schemas/location";

export type LocationFormState = {
  error?: string;
  success?: boolean;
};

export async function createLocationAction(
  _prev: LocationFormState,
  formData: FormData,
): Promise<LocationFormState> {
  const session = await requireManageMasterDataSession();
  const { tenantId, needsTenantSelection } = getMasterDataTenantScope(session);

  if (needsTenantSelection || !tenantId) {
    return { error: "Pilih tenant aktif terlebih dahulu." };
  }

  const parsed = locationSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  try {
    await prisma.location.create({
      data: {
        tenant_id: tenantId,
        name: parsed.data.name,
      },
    });
  } catch {
    return { error: "Gagal membuat lokasi." };
  }

  revalidatePath("/dashboard/locations");
  revalidatePath("/dashboard/cages");
  return { success: true };
}
