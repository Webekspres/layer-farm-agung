import { isUserAssignedToCage } from "@/features/cages/services/is-user-assigned-to-cage";
import {
  applyEggStockMutation as defaultApplyEggStockMutation,
  type ApplyEggStockMutation,
} from "@/features/eggs/services/apply-egg-stock-mutation";
import { EggMovementType } from "@/features/eggs/lib/egg-mutation-types";
import { isPrismaUniqueViolation } from "@/features/production/lib/client-mutation-id";
import { resolveProductionBuckets } from "@/features/production/lib/production-grade-mapping";
import {
  resolveUserRoleName,
  validateOperationalInputDate,
} from "@/features/production/lib/input-window";
import type { DailyProductionInput } from "@/features/production/schemas/daily-production";
import { ensureDailyReport } from "@/features/production/services/ensure-daily-report";
import { validateOperationalBusinessDate } from "@/lib/business-date";
import defaultPrisma from "@/lib/prisma";

export type RecordDailyProductionResult =
  | { ok: true; idempotent: boolean; recordId: string }
  | { ok: false; error: string };

export type RecordDailyProductionOptions = {
  deps?: {
    prisma?: typeof defaultPrisma;
    applyEggStockMutation?: ApplyEggStockMutation;
  };
};

class StockError extends Error {}

export async function recordDailyProduction(
  tenantId: string,
  userId: string,
  input: DailyProductionInput,
  options: RecordDailyProductionOptions = {},
): Promise<RecordDailyProductionResult> {
  const prisma = options.deps?.prisma ?? defaultPrisma;
  const applyStockMutation = options.deps?.applyEggStockMutation ?? defaultApplyEggStockMutation;

  if (input.clientMutationId) {
    const existing = await prisma.dailyProduction.findUnique({
      where: { client_mutation_id: input.clientMutationId },
      select: { id: true },
    });

    if (existing) {
      return { ok: true, idempotent: true, recordId: existing.id };
    }
  }

  const cage = await prisma.cage.findFirst({
    where: {
      id: input.cageId,
      location: { tenant_id: tenantId },
    },
    select: {
      id: true,
      status: true,
      location_id: true,
      cycle_settings: {
        where: { status: "Active" },
        take: 1,
        select: { id: true, start_date: true, go_live_date: true, end_date: true },
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

  const dateCheck = validateOperationalBusinessDate(input.recordDate);
  if (!dateCheck.ok) {
    return { ok: false, error: dateCheck.error };
  }

  const roleName = await resolveUserRoleName(userId);
  const windowCheck = await validateOperationalInputDate({
    tenantId,
    roleName,
    recordDate: dateCheck.date,
    cycle: cage.cycle_settings[0] ?? null,
  });
  if (!windowCheck.ok) {
    return { ok: false, error: windowCheck.error };
  }

  const grades = await prisma.eggGrade.findMany({
    where: { id: { in: input.entries.map((entry) => entry.eggGradeId) } },
    select: { id: true, code: true, is_active: true },
  });

  const resolved = resolveProductionBuckets(input.entries, grades);
  if (!resolved.ok) {
    return { ok: false, error: resolved.error };
  }

  const recordDate = dateCheck.date;
  const isSynced = !input.fromSync;
  const { tb, tr, tp } = resolved.buckets;

  try {
    const recordId = await prisma.$transaction(async (tx) => {
      const production = await tx.dailyProduction.create({
        data: {
          tenant_id: tenantId,
          cage_id: input.cageId,
          user_id: userId,
          record_date: recordDate,
          tb,
          tr,
          tp,
          weight: input.weight ?? null,
          is_synced: isSynced,
          client_mutation_id: input.clientMutationId ?? null,
          items: {
            create: input.entries.map((entry) => ({
              egg_grade_id: entry.eggGradeId,
              quantity: entry.quantity,
            })),
          },
        },
        select: { id: true },
      });

      // Stok jual telur masuk per grade panen (IN_HARVEST) ke lokasi kandang.
      for (const entry of input.entries) {
        const stock = await applyStockMutation(tx, {
          tenantId,
          eggGradeId: entry.eggGradeId,
          locationId: cage.location_id,
          mutationType: EggMovementType.IN_HARVEST,
          quantity: entry.quantity,
          referenceId: production.id,
        });

        if (!stock.ok) {
          throw new StockError(stock.error);
        }
      }

      await ensureDailyReport(tenantId, input.cageId, recordDate, tx);

      return production.id;
    });

    return { ok: true, idempotent: false, recordId };
  } catch (error) {
    if (input.clientMutationId && isPrismaUniqueViolation(error)) {
      const existing = await prisma.dailyProduction.findUnique({
        where: { client_mutation_id: input.clientMutationId },
        select: { id: true },
      });

      if (existing) {
        return { ok: true, idempotent: true, recordId: existing.id };
      }
    }

    if (error instanceof StockError) {
      return { ok: false, error: error.message };
    }

    return { ok: false, error: "Gagal menyimpan produksi harian." };
  }
}
