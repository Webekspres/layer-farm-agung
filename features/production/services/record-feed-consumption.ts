import { isUserAssignedToCage } from "@/features/cages/services/is-user-assigned-to-cage";
import { applyStockMutation } from "@/features/inventory/services/apply-stock-mutation";
import { StockMutationType } from "@/features/inventory/lib/stock-mutation-types";
import type { FeedConsumptionInput } from "@/features/production/schemas/feed-consumption";
import prisma from "@/lib/prisma";

export type RecordFeedConsumptionResult =
  | { ok: true; lowStock: boolean; remainingStock: number }
  | { ok: false; error: string };

function startOfUtcDate(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export async function recordFeedConsumption(
  tenantId: string,
  userId: string,
  input: FeedConsumptionInput,
): Promise<RecordFeedConsumptionResult> {
  // Verify cage belongs to this tenant
  const cage = await prisma.cage.findFirst({
    where: {
      id: input.cageId,
      location: { tenant_id: tenantId },
    },
    select: { id: true, status: true, location_id: true },
  });

  if (!cage) {
    return { ok: false, error: "Kandang tidak ditemukan di tenant ini." };
  }

  // Verify user is assigned to this cage
  const assigned = await isUserAssignedToCage(userId, input.cageId);
  if (!assigned) {
    return { ok: false, error: "Anda tidak ditugaskan ke kandang ini." };
  }

  if (cage.status !== "Active") {
    return { ok: false, error: "Kandang tidak aktif." };
  }

  // Verify item belongs to this tenant and is a feed type
  const item = await prisma.item.findFirst({
    where: {
      id: input.itemId,
      tenant_id: tenantId,
    },
    select: { id: true, type: true, unit: true },
  });

  if (!item) {
    return { ok: false, error: "Item pakan tidak ditemukan di tenant ini." };
  }

  const isFeedType =
    item.type.toLowerCase() === "pakan" || item.type.toLowerCase() === "feed";
  if (!isFeedType) {
    return { ok: false, error: "Item yang dipilih bukan jenis pakan." };
  }

  const recordDate = startOfUtcDate(input.recordDate);

  try {
    const outcome = await prisma.$transaction(async (tx) => {
      const feedConsumption = await tx.feedConsumption.create({
        data: {
          tenant_id: tenantId,
          cage_id: input.cageId,
          item_id: input.itemId,
          user_id: userId,
          record_date: recordDate,
          quantity: input.quantity,
          notes: input.notes ?? null,
          is_synced: true,
        },
        select: { id: true },
      });

      const stock = await applyStockMutation(tx, {
        itemId: input.itemId,
        locationId: cage.location_id,
        mutationType: StockMutationType.OUT_FEED,
        quantity: input.quantity,
        referenceId: feedConsumption.id,
      });

      if (!stock.ok) {
        // Rolls back the FeedConsumption insert too.
        throw new StockError(stock.error);
      }

      return { lowStock: stock.lowStock, remainingStock: stock.newQuantity };
    });

    return { ok: true, lowStock: outcome.lowStock, remainingStock: outcome.remainingStock };
  } catch (error) {
    if (error instanceof StockError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "Gagal menyimpan konsumsi pakan." };
  }
}

class StockError extends Error {}
