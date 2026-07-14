"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  getMasterDataTenantScope,
  requireManageMasterDataSession,
} from "@/features/master-data/lib/access";
import { STAFF_ROLE_NAME } from "@/features/roles/config/system-roles";
import { replaceCageStaffAssignments } from "@/features/cages/lib/cage-staff-db";
import prisma from "@/lib/prisma";

const updateCageStaffSchema = z.object({
  cageId: z.string().uuid("Kandang tidak valid."),
  staffIds: z.array(z.string().uuid()).default([]),
});

export type CageStaffFormState = {
  error?: string;
  success?: boolean;
};

export async function updateCageStaffAction(
  _prev: CageStaffFormState,
  formData: FormData,
): Promise<CageStaffFormState> {
  const session = await requireManageMasterDataSession();
  const { tenantId, needsTenantSelection } = getMasterDataTenantScope(session);

  if (needsTenantSelection || !tenantId) {
    return { error: "Pilih tenant aktif terlebih dahulu." };
  }

  const staffIds = formData.getAll("staffIds").map(String);

  const parsed = updateCageStaffSchema.safeParse({
    cageId: formData.get("cageId"),
    staffIds,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const { cageId, staffIds: selectedStaffIds } = parsed.data;

  const cage = await prisma.cage.findFirst({
    where: { id: cageId, location: { tenant_id: tenantId } },
    select: { id: true },
  });

  if (!cage) {
    return { error: "Kandang tidak ditemukan." };
  }

  if (selectedStaffIds.length > 0) {
    const validStaff = await prisma.user.findMany({
      where: {
        id: { in: selectedStaffIds },
        tenant_id: tenantId,
        is_active: true,
        role: { name: STAFF_ROLE_NAME },
      },
      select: { id: true },
    });

    if (validStaff.length !== selectedStaffIds.length) {
      return { error: "Daftar staff tidak valid untuk tenant ini." };
    }
  }

  try {
    await replaceCageStaffAssignments(cageId, selectedStaffIds);
  } catch {
    return { error: "Gagal memperbarui penugasan staff." };
  }

  revalidatePath(`/dashboard/cages/${cageId}`);
  revalidatePath("/dashboard/cages");
  return { success: true };
}
