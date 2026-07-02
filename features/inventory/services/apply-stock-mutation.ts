import type { Prisma } from "@/generated/prisma/client";
import {
  directionOf,
  type StockMutationType,
} from "@/features/inventory/lib/stock-mutation-types";

/**
 * A Prisma transaction client. `applyStockMutation` never opens its own
 * transaction — the caller must run it inside `prisma.$transaction(...)` so the
 * source record (FeedConsumption / MedicalRecord / DailyProduction) and the
 * stock movement are written atomically.
 */
export type TxClient = Prisma.TransactionClient;

export type ApplyStockMutationParams = {
  /** Item whose stock moves. Caller must have verified it belongs to the tenant. */
  itemId: string;
  /** Location holding the stock (a cage's `location_id`). */
  locationId: string;
  /** One of {@link StockMutationType}; its prefix decides IN vs OUT. */
  mutationType: StockMutationType | string;
  /** Positive magnitude of the movement, in the item's own unit. */
  quantity: number;
  /** Id of the source record (for the audit ledger). */
  referenceId?: string | null;
  /**
   * Reconciliation escape hatch: when true, an OUT is applied even if it drives
   * the balance below zero (used only when correcting a previous IN, e.g.
   * editing a harvest downward). Default false → OUT rejects on insufficient stock.
   */
  allowNegative?: boolean;
};

export type ApplyStockMutationResult =
  | {
      ok: true;
      newQuantity: number;
      /** True when the resulting balance is at/below the item's alert threshold. */
      lowStock: boolean;
      minStockAlert: number | null;
    }
  | { ok: false; error: string };

/**
 * Atomically increment/decrement an `(item, location)` stock balance and append
 * a `StockMutation` ledger row, inside the caller's transaction.
 *
 * OUT movements use a DB-level guarded decrement (`quantity >= amount`) so two
 * concurrent submits can never oversell the same stock without row locks.
 */
export async function applyStockMutation(
  tx: TxClient,
  params: ApplyStockMutationParams,
): Promise<ApplyStockMutationResult> {
  const { itemId, locationId, mutationType, referenceId } = params;
  const quantity = params.quantity;

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return { ok: false, error: "Jumlah mutasi stok harus lebih dari 0." };
  }

  const item = await tx.item.findUnique({
    where: { id: itemId },
    select: { min_stock_alert: true },
  });

  if (!item) {
    return { ok: false, error: "Item inventori tidak ditemukan." };
  }

  const direction = directionOf(mutationType);

  if (direction === "IN") {
    const stock = await tx.inventoryStock.upsert({
      where: { item_id_location_id: { item_id: itemId, location_id: locationId } },
      update: { quantity: { increment: quantity } },
      create: { item_id: itemId, location_id: locationId, quantity },
      select: { quantity: true },
    });

    await tx.stockMutation.create({
      data: {
        item_id: itemId,
        mutation_type: mutationType,
        quantity,
        reference_id: referenceId ?? null,
      },
    });

    return {
      ok: true,
      newQuantity: stock.quantity,
      lowStock:
        item.min_stock_alert != null && stock.quantity <= item.min_stock_alert,
      minStockAlert: item.min_stock_alert,
    };
  }

  // direction === "OUT"
  if (params.allowNegative) {
    // Reconciliation: decrement (may create the row), no stock guard.
    const stock = await tx.inventoryStock.upsert({
      where: { item_id_location_id: { item_id: itemId, location_id: locationId } },
      update: { quantity: { decrement: quantity } },
      create: { item_id: itemId, location_id: locationId, quantity: -quantity },
      select: { quantity: true },
    });

    await tx.stockMutation.create({
      data: {
        item_id: itemId,
        mutation_type: mutationType,
        quantity,
        reference_id: referenceId ?? null,
      },
    });

    return {
      ok: true,
      newQuantity: stock.quantity,
      lowStock:
        item.min_stock_alert != null && stock.quantity <= item.min_stock_alert,
      minStockAlert: item.min_stock_alert,
    };
  }

  // Guarded decrement: only succeeds if there is enough stock.
  const updated = await tx.inventoryStock.updateMany({
    where: {
      item_id: itemId,
      location_id: locationId,
      quantity: { gte: quantity },
    },
    data: { quantity: { decrement: quantity } },
  });

  if (updated.count === 0) {
    return {
      ok: false,
      error: "Stok tidak mencukupi untuk jumlah yang dimasukkan.",
    };
  }

  const stock = await tx.inventoryStock.findUnique({
    where: { item_id_location_id: { item_id: itemId, location_id: locationId } },
    select: { quantity: true },
  });

  await tx.stockMutation.create({
    data: {
      item_id: itemId,
      mutation_type: mutationType,
      quantity,
      reference_id: referenceId ?? null,
    },
  });

  const newQuantity = stock?.quantity ?? 0;

  return {
    ok: true,
    newQuantity,
    lowStock: item.min_stock_alert != null && newQuantity <= item.min_stock_alert,
    minStockAlert: item.min_stock_alert,
  };
}
