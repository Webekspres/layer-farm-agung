import { isUserAssignedToCage } from "@/features/cages/services/is-user-assigned-to-cage";
import type { DailyProductionInput } from "@/features/production/schemas/daily-production";
import prisma from "@/lib/prisma";

export type RecordDailyProductionResult =
  | { ok: true }
  | { ok: false; error: string };

function startOfUtcDate(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export async function recordDailyProduction(
  tenantId: string,
  userId: string,
  input: DailyProductionInput,
): Promise<RecordDailyProductionResult> {
  const cage = await prisma.cage.findFirst({
    where: {
      id: input.cageId,
      location: { tenant_id: tenantId },
    },
    select: {
      id: true,
      status: true,
      cycle_settings: {
        where: { status: "Active" },
        take: 1,
        select: { id: true },
      },
    },
  });

  if (!cage) {
    return { ok: false, error: "Kandang tidak ditemukan di tenant ini." };
  }

  const assigned = await isUserAssignedToCage(userId, input.cageId);

  if (!assigned) {
    return {
      ok: false,
      error: "Anda tidak ditugaskan ke kandang ini.",
    };
  }

  if (cage.status !== "Active") {
    return {
      ok: false,
      error: "Kandang tidak aktif. Tidak dapat mencatat produksi.",
    };
  }

  if (cage.cycle_settings.length === 0) {
    return {
      ok: false,
      error: "Kandang belum memiliki siklus aktif. Hubungi admin.",
    };
  }

  const recordDate = startOfUtcDate(input.recordDate);

  try {
    await prisma.dailyProduction.create({
      data: {
        tenant_id: tenantId,
        cage_id: input.cageId,
        user_id: userId,
        record_date: recordDate,
        tb: input.tb,
        tr: input.tr,
        tp: input.tp,
        weight: input.weight ?? null,
        is_synced: true,
      },
    });
  } catch {
    return { ok: false, error: "Gagal menyimpan produksi harian." };
  }

  return { ok: true };
}
