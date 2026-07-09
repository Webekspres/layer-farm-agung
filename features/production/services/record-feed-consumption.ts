import { isUserAssignedToCage } from "@/features/cages/services/is-user-assigned-to-cage";
import { applyStockMutation } from "@/features/inventory/services/apply-stock-mutation";
import { StockMutationType } from "@/features/inventory/lib/stock-mutation-types";
import { isPrismaUniqueViolation } from "@/features/production/lib/client-mutation-id";
import type { FeedConsumptionInput } from "@/features/production/schemas/feed-consumption";
import { validateOperationalBusinessDate } from "@/lib/business-date";
import prisma from "@/lib/prisma";

export type RecordFeedConsumptionResult =
  | {
      ok: true;
      idempotent: boolean;
      recordId: string;
      lowStock: boolean;
      remainingStock: number;
    }
  | { ok: false; error: string };

class StockError extends Error {}

export async function recordFeedConsumption(
  tenantId: string,
  userId: string,
  input: FeedConsumptionInput,
): Promise<RecordFeedConsumptionResult> {
  if (input.clientMutationId) {
    const existing = await prisma.feedConsumption.findUnique({
      where: { client_mutation_id: input.clientMutationId },
      select: { id: true },
    });

    if (existing) {
      return {
        ok: true,
        idempotent: true,
        recordId: existing.id,
        lowStock: false,
        remainingStock: 0,
      };
    }
  }

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

  const assigned = await isUserAssignedToCage(userId, input.cageId);
  if (!assigned) {
    return { ok: false, error: "Anda tidak ditugaskan ke kandang ini." };
  }

  if (cage.status !== "Active") {
    return { ok: false, error: "Kandang tidak aktif." };
  }

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

  const dateCheck = validateOperationalBusinessDate(input.recordDate);
  if (!dateCheck.ok) {
    return { ok: false, error: dateCheck.error };
  }

  const recordDate = dateCheck.date;
  const isSynced = !input.fromSync;

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
          is_synced: isSynced,
          client_mutation_id: input.clientMutationId ?? null,
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
        throw new StockError(stock.error);
      }

      return {
        recordId: feedConsumption.id,
        lowStock: stock.lowStock,
        remainingStock: stock.newQuantity,
      };
    });

    return {
      ok: true,
      idempotent: false,
      recordId: outcome.recordId,
      lowStock: outcome.lowStock,
      remainingStock: outcome.remainingStock,
    };
  } catch (error) {
    if (input.clientMutationId && isPrismaUniqueViolation(error)) {
      const existing = await prisma.feedConsumption.findUnique({
        where: { client_mutation_id: input.clientMutationId },
        select: { id: true },
      });

      if (existing) {
        return {
          ok: true,
          idempotent: true,
          recordId: existing.id,
          lowStock: false,
          remainingStock: 0,
        };
      }
    }

    if (error instanceof StockError) {
      return { ok: false, error: error.message };
    }

    return { ok: false, error: "Gagal menyimpan konsumsi pakan." };
  }
}
