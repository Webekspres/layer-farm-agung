import { isUserAssignedToCage } from "@/features/cages/services/is-user-assigned-to-cage";
import { applyStockMutation } from "@/features/inventory/services/apply-stock-mutation";
import { StockMutationType } from "@/features/inventory/lib/stock-mutation-types";
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
      tb: true,
      cage: { select: { location_id: true } },
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

  // Reconcile egg stock so it stays consistent with the edited TB count.
  const tbDelta = input.tb - existing.tb;
  const eggItem =
    tbDelta !== 0
      ? await prisma.item.findFirst({
          where: { tenant_id: tenantId, type: "Egg" },
          select: { id: true },
        })
      : null;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.dailyProduction.update({
        where: { id: recordId },
        data: {
          tb: input.tb,
          tr: input.tr,
          tp: input.tp,
        },
      });

      if (eggItem && tbDelta !== 0) {
        await applyStockMutation(tx, {
          itemId: eggItem.id,
          locationId: existing.cage.location_id,
          // Positive delta = extra harvest; negative delta = correction down.
          mutationType:
            tbDelta > 0
              ? StockMutationType.IN_HARVEST
              : StockMutationType.OUT_ADJUSTMENT,
          quantity: Math.abs(tbDelta),
          referenceId: recordId,
          // Correcting a prior IN — allow the balance to drop even if other
          // movements have since reduced it.
          allowNegative: tbDelta < 0,
        });
      }
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
