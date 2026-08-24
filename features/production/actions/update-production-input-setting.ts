"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  getActiveTenantId,
} from "@/features/auth/lib/session";
import { requirePermission } from "@/features/auth/lib/require-permission";
import { STAFF_ROLE_NAME } from "@/features/roles/config/system-roles";
import prisma from "@/lib/prisma";

export type ProductionInputSettingFormState = {
  error?: string;
  success?: boolean;
};

const updateProductionInputSettingSchema = z.object({
  staffLookbackDays: z.coerce
    .number()
    .int()
    .min(0, "Batas hari staf minimal 0.")
    .max(365, "Batas hari staf maksimal 365."),
  adminLookbackDays: z.coerce
    .number()
    .int()
    .min(0, "Batas hari admin minimal 0.")
    .max(365, "Batas hari admin maksimal 365."),
});

export async function updateProductionInputSettingAction(
  _prev: ProductionInputSettingFormState,
  formData: FormData,
): Promise<ProductionInputSettingFormState> {
  const session = await requirePermission("manage_production");

  // Hanya admin tenant (bukan staf lapangan) yang boleh mengubah kebijakan input.
  if (session.user.roleName === STAFF_ROLE_NAME) {
    return { error: "Staf lapangan tidak berwenang mengubah kebijakan input." };
  }

  const tenantId = getActiveTenantId(session);
  if (!tenantId) {
    return { error: "Pilih tenant aktif terlebih dahulu." };
  }

  const parsed = updateProductionInputSettingSchema.safeParse({
    staffLookbackDays: formData.get("staff_lookback_days"),
    adminLookbackDays: formData.get("admin_lookback_days"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  try {
    await prisma.tenantProductionSetting.upsert({
      where: { tenant_id: tenantId },
      update: {
        staff_lookback_days: parsed.data.staffLookbackDays,
        admin_lookback_days: parsed.data.adminLookbackDays,
      },
      create: {
        tenant_id: tenantId,
        staff_lookback_days: parsed.data.staffLookbackDays,
        admin_lookback_days: parsed.data.adminLookbackDays,
      },
    });
  } catch {
    return { error: "Gagal menyimpan kebijakan input." };
  }

  revalidatePath("/dashboard/settings/input-control");
  return { success: true };
}
