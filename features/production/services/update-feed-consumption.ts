import { isUserAssignedToCage } from "@/features/cages/services/is-user-assigned-to-cage";
import { applyStockMutation } from "@/features/inventory/services/apply-stock-mutation";
import { StockMutationType } from "@/features/inventory/lib/stock-mutation-types";
import type { UpdateFeedConsumptionInput } from "@/features/production/schemas/update-feed-consumption";
import prisma from "@/lib/prisma";

export type UpdateFeedConsumptionResult =
  | { ok: true }
  | { ok: false; error: string; status: 400 | 403 | 404 };

class StockError extends Error {}

export async function updateFeedConsumption(
  tenantId: string,
  userId: string,
  recordId: string,
  input: UpdateFeedConsumptionInput,
): Promise<UpdateFeedConsumptionResult> {
  const existing = await prisma.feedConsumption.findFirst({
    where: { id: recordId, tenant_id: tenantId },
    select: {
      id: true,
      cage_id: true,
      item_id: true,
      quantity: true,
      cage: { select: { location_id: true } },
    },
  });

  if (!existing) {
    return {
      ok: false,
      error: "Catatan konsumsi pakan tidak ditemukan.",
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

  // Only the quantity actually taken from stock changes; delta re-applies the
  // difference so InventoryStock stays consistent with the corrected value.
  const delta = input.quantity - existing.quantity;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.feedConsumption.update({
        where: { id: recordId },
        data: {
          quantity: input.quantity,
          notes: input.notes ?? null,
        },
      });

      if (delta !== 0) {
        const result = await applyStockMutation(tx, {
          itemId: existing.item_id,
          locationId: existing.cage.location_id,
          mutationType:
            delta > 0
              ? StockMutationType.OUT_FEED
              : StockMutationType.IN_ADJUSTMENT,
          quantity: Math.abs(delta),
          referenceId: recordId,
        });

        if (!result.ok) {
          throw new StockError(result.error);
        }
      }
    });
  } catch (error) {
    if (error instanceof StockError) {
      return { ok: false, error: error.message, status: 400 };
    }
    return {
      ok: false,
      error: "Gagal memperbarui konsumsi pakan.",
      status: 400,
    };
  }

  return { ok: true };
}
