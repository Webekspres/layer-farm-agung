"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
  getMasterDataTenantScope,
  requireManageMasterDataSession,
} from "@/features/master-data/lib/access";
import { setCageQrCode } from "@/features/cages/lib/cage-staff-db";
import { generateCageQrCode } from "@/features/cages/lib/generate-qr-code";
import { cageSchema } from "@/features/cages/schemas/cage";

export type CageFormState = {
  error?: string;
  success?: boolean;
};

export async function createCageAction(
  _prev: CageFormState,
  formData: FormData,
): Promise<CageFormState> {
  const session = await requireManageMasterDataSession();
  const { tenantId, needsTenantSelection } = getMasterDataTenantScope(session);

  if (needsTenantSelection || !tenantId) {
    return { error: "Pilih tenant aktif terlebih dahulu." };
  }

  const parsed = cageSchema.safeParse({
    locationId: formData.get("locationId"),
    strainId: formData.get("strainId"),
    name: formData.get("name"),
    cageType: formData.get("cageType") || undefined,
    cageTypeCustom: formData.get("cageTypeCustom") || undefined,
    capacity: formData.get("capacity"),
    status: formData.get("status") ?? "Active",
    cycleStartDate: formData.get("cycleStartDate") || undefined,
    initialPopulation: formData.get("initialPopulation") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const data = parsed.data;

  const location = await prisma.location.findFirst({
    where: { id: data.locationId, tenant_id: tenantId },
    select: { id: true },
  });

  if (!location) {
    return { error: "Lokasi tidak ditemukan untuk tenant ini." };
  }

  const strain = await prisma.strain.findUnique({
    where: { id: data.strainId },
    select: { id: true },
  });

  if (!strain) {
    return { error: "Strain tidak ditemukan." };
  }

  const finalCageType = data.cageType === "Lainnya" ? data.cageTypeCustom : data.cageType;

  try {
    await prisma.$transaction(async (tx) => {
      const cage = await tx.cage.create({
        data: {
          location_id: data.locationId,
          strain_id: data.strainId,
          name: data.name,
          cage_type: finalCageType || null,
          capacity: data.capacity,
          status: data.status,
        },
      });

      await setCageQrCode(cage.id, generateCageQrCode());

      // Temporarily bypassed CycleSetting insertion because backend infrastructure is under development
      /*
      if (data.cycleStartDate && data.initialPopulation) {
        await tx.cycleSetting.create({
          data: {
            cage_id: cage.id,
            start_date: new Date(data.cycleStartDate),
            initial_population: data.initialPopulation,
            status: "Active",
          },
        });
      }
      */
    });
  } catch {
    return { error: "Gagal membuat kandang." };
  }

  revalidatePath("/dashboard/cages");
  return { success: true };
}
