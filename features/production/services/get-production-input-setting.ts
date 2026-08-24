import {
  DEFAULT_ADMIN_LOOKBACK_DAYS,
  DEFAULT_STAFF_LOOKBACK_DAYS,
} from "@/features/production/lib/input-window";
import prisma from "@/lib/prisma";

export type ProductionInputSetting = {
  staffLookbackDays: number;
  adminLookbackDays: number;
};

/** Baca kebijakan lookback tenant; fallback default saat baris belum ada. */
export async function getProductionInputSetting(
  tenantId: string,
): Promise<ProductionInputSetting> {
  const setting = await prisma.tenantProductionSetting.findUnique({
    where: { tenant_id: tenantId },
    select: { staff_lookback_days: true, admin_lookback_days: true },
  });

  return {
    staffLookbackDays:
      setting?.staff_lookback_days ?? DEFAULT_STAFF_LOOKBACK_DAYS,
    adminLookbackDays:
      setting?.admin_lookback_days ?? DEFAULT_ADMIN_LOOKBACK_DAYS,
  };
}
