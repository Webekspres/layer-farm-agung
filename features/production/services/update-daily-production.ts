import { isUserAssignedToCage } from "@/features/cages/services/is-user-assigned-to-cage";
import type { UpdateDailyProductionInput } from "@/features/production/schemas/update-daily-production";
import prisma from "@/lib/prisma";

export type UpdateDailyProductionResult =
  | { ok: true }
  | { ok: false; error: string; status: 400 | 403 | 404 };

export async function updateDailyProduction(
  tenantId: string,
  userId: string,
  recordId: string,
  input: UpdateDailyProductionInput,
): Promise<UpdateDailyProductionResult> {
  const existing = await prisma.dailyProduction.findFirst({
    where: {
      id: recordId,
      tenant_id: tenantId,
    },
    select: {
      id: true,
      cage_id: true,
    },
  });

  if (!existing) {
    return {
      ok: false,
      error: "Catatan produksi tidak ditemukan.",
      status: 404,
    };
  }

  const assigned = await isUserAssignedToCage(userId, existing.cage_id);

  if (!assigned) {
    return {
      ok: false,
      error: "Anda tidak ditugaskan ke kandang ini.",
      status: 403,
    };
  }

  try {
    await prisma.dailyProduction.update({
      where: { id: recordId },
      data: {
        tb: input.tb,
        tr: input.tr,
        tp: input.tp,
      },
    });
  } catch {
    return {
      ok: false,
      error: "Gagal memperbarui produksi harian.",
      status: 400,
    };
  }

  return { ok: true };
}
