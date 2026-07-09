import { isUserAssignedToCage } from "@/features/cages/services/is-user-assigned-to-cage";
import { applyStockMutation } from "@/features/inventory/services/apply-stock-mutation";
import { StockMutationType } from "@/features/inventory/lib/stock-mutation-types";
import { isPrismaUniqueViolation } from "@/features/production/lib/client-mutation-id";
import type { DailyProductionInput } from "@/features/production/schemas/daily-production";
import {
  validateOperationalBusinessDate,
} from "@/lib/business-date";
import prisma from "@/lib/prisma";

export type RecordDailyProductionResult =
  | { ok: true; idempotent: boolean; recordId: string }
  | { ok: false; error: string };

class StockError extends Error {}

export async function recordDailyProduction(
  tenantId: string,
  userId: string,
  input: DailyProductionInput,
): Promise<RecordDailyProductionResult> {
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

  const dateCheck = validateOperationalBusinessDate(input.recordDate);
  if (!dateCheck.ok) {
    return { ok: false, error: dateCheck.error };
  }

  const recordDate = dateCheck.date;
  const isSynced = !input.fromSync;

  const eggItem = await prisma.item.findFirst({
    where: { tenant_id: tenantId, type: "Egg" },
    select: { id: true },
  });

  try {
    const recordId = await prisma.$transaction(async (tx) => {
      const production = await tx.dailyProduction.create({
        data: {
          tenant_id: tenantId,
          cage_id: input.cageId,
          user_id: userId,
          record_date: recordDate,
          tb: input.tb,
          tr: input.tr,
          tp: input.tp,
          weight: input.weight ?? null,
          is_synced: isSynced,
          client_mutation_id: input.clientMutationId ?? null,
        },
        select: { id: true },
      });

      if (eggItem && input.tb > 0) {
        const stock = await applyStockMutation(tx, {
          itemId: eggItem.id,
          locationId: cage.location_id,
          mutationType: StockMutationType.IN_HARVEST,
          quantity: input.tb,
          referenceId: production.id,
        });

        if (!stock.ok) {
          throw new StockError(stock.error);
        }
      }

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
