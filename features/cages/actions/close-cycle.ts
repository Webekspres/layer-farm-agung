"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
  getMasterDataTenantScope,
  requireManageMasterDataSession,
} from "@/features/master-data/lib/access";
import { closeCycleSchema } from "@/features/cages/schemas/cycle";

export type ActionState = {
  error?: string;
  success?: boolean;
};

export async function closeCycleAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireManageMasterDataSession();
  const { tenantId } = getMasterDataTenantScope(session);

  if (!tenantId) {
    return { error: "Pilih tenant aktif terlebih dahulu." };
  }

  const rawCycleId = formData.get("cycleId");
  const rawEndDate = formData.get("endDate");

  const parsed = closeCycleSchema.safeParse({
    cycleId: rawCycleId,
    endDate: rawEndDate,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const { cycleId, endDate } = parsed.data;

  // Find active cycle and verify ownership through cage -> location
  const cycle = await prisma.cycleSetting.findFirst({
    where: {
      id: cycleId,
      status: "Active",
      cage: {
        location: { tenant_id: tenantId },
      },
    },
    select: {
      id: true,
      start_date: true,
      cage_id: true,
    },
  });

  if (!cycle) {
    return { error: "Siklus aktif tidak ditemukan." };
  }

  // Ensure end date is not before start date
  if (endDate < cycle.start_date) {
    return {
      error: "Tanggal selesai tidak boleh sebelum tanggal mulai siklus.",
    };
  }

  // Ensure end date is not a future date
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (endDate > today) {
    return {
      error: "Tanggal selesai tidak boleh di masa depan.",
    };
  }

  try {
    await prisma.cycleSetting.update({
      where: { id: cycleId },
      data: {
        status: "Closed",
        end_date: endDate,
      },
    });
  } catch {
    return { error: "Gagal menutup siklus." };
  }

  revalidatePath(`/dashboard/cages/${cycle.cage_id}`);
  revalidatePath("/dashboard/cages");
  return { success: true };
}
