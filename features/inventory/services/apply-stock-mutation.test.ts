import { describe, expect, test } from "bun:test";

import { applyStockMutation, type TxClient } from "./apply-stock-mutation";
import { StockMutationType } from "@/features/inventory/lib/stock-mutation-types";

const ITEM = "item-1";
const LOC = "loc-1";

/**
 * Minimal in-memory fake of the Prisma transaction client covering only the
 * methods `applyStockMutation` uses, so we can exercise the stock math and
 * branching without a database.
 */
function makeTx(opts: {
  minStockAlert: number | null;
  startQuantity: number | null; // null → no stock row exists yet
}) {
  let quantity = opts.startQuantity;
  const mutations: Array<{ mutation_type: string; quantity: number }> = [];

  const tx = {
    item: {
      findUnique: async () =>
        // caller passes a known item id in tests
        ({ min_stock_alert: opts.minStockAlert }),
    },
    inventoryStock: {
      upsert: async ({
        update,
        create,
      }: {
        update: { quantity?: { increment?: number; decrement?: number } };
        create: { quantity: number };
      }) => {
        if (quantity == null) {
          quantity = create.quantity;
        } else if (update.quantity?.increment != null) {
          quantity += update.quantity.increment;
        } else if (update.quantity?.decrement != null) {
          quantity -= update.quantity.decrement;
        }
        return { quantity };
      },
      updateMany: async ({
        where,
        data,
      }: {
        where: { quantity?: { gte?: number } };
        data: { quantity: { decrement: number } };
      }) => {
        const gte = where.quantity?.gte ?? 0;
        if (quantity != null && quantity >= gte) {
          quantity -= data.quantity.decrement;
          return { count: 1 };
        }
        return { count: 0 };
      },
      findUnique: async () => (quantity == null ? null : { quantity }),
    },
    stockMutation: {
      create: async ({
        data,
      }: {
        data: { mutation_type: string; quantity: number };
      }) => {
        mutations.push({
          mutation_type: data.mutation_type,
          quantity: data.quantity,
        });
        return data;
      },
    },
  };

  return { tx: tx as unknown as TxClient, mutations, getQuantity: () => quantity };
}

describe("applyStockMutation", () => {
  test("IN increments stock and logs an IN mutation", async () => {
    const { tx, mutations, getQuantity } = makeTx({
      minStockAlert: 100,
      startQuantity: 500,
    });

    const result = await applyStockMutation(tx, {
      itemId: ITEM,
      locationId: LOC,
      mutationType: StockMutationType.IN_PURCHASE,
      quantity: 250,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.newQuantity).toBe(750);
      expect(result.lowStock).toBe(false);
    }
    expect(getQuantity()).toBe(750);
    expect(mutations[0]?.mutation_type).toBe("IN_PURCHASE");
  });

  test("OUT with sufficient stock decrements and logs an OUT mutation", async () => {
    const { tx, mutations } = makeTx({ minStockAlert: 100, startQuantity: 500 });

    const result = await applyStockMutation(tx, {
      itemId: ITEM,
      locationId: LOC,
      mutationType: StockMutationType.OUT_FEED,
      quantity: 200,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.newQuantity).toBe(300);
      expect(result.lowStock).toBe(false);
    }
    expect(mutations[0]?.mutation_type).toBe("OUT_FEED");
  });

  test("OUT rejects when stock is insufficient (no oversell)", async () => {
    const { tx } = makeTx({ minStockAlert: 100, startQuantity: 50 });

    const result = await applyStockMutation(tx, {
      itemId: ITEM,
      locationId: LOC,
      mutationType: StockMutationType.OUT_FEED,
      quantity: 200,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("tidak mencukupi");
    }
  });

  test("OUT rejects when no stock row exists", async () => {
    const { tx } = makeTx({ minStockAlert: null, startQuantity: null });

    const result = await applyStockMutation(tx, {
      itemId: ITEM,
      locationId: LOC,
      mutationType: StockMutationType.OUT_MEDICAL,
      quantity: 1,
    });

    expect(result.ok).toBe(false);
  });

  test("low-stock boundary: resulting balance == threshold flags lowStock", async () => {
    const { tx } = makeTx({ minStockAlert: 100, startQuantity: 300 });

    const result = await applyStockMutation(tx, {
      itemId: ITEM,
      locationId: LOC,
      mutationType: StockMutationType.OUT_FEED,
      quantity: 200,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.newQuantity).toBe(100);
      expect(result.lowStock).toBe(true);
    }
  });

  test("rejects non-positive quantity", async () => {
    const { tx } = makeTx({ minStockAlert: null, startQuantity: 500 });

    const zero = await applyStockMutation(tx, {
      itemId: ITEM,
      locationId: LOC,
      mutationType: StockMutationType.OUT_FEED,
      quantity: 0,
    });
    expect(zero.ok).toBe(false);

    const negative = await applyStockMutation(tx, {
      itemId: ITEM,
      locationId: LOC,
      mutationType: StockMutationType.IN_PURCHASE,
      quantity: -5,
    });
    expect(negative.ok).toBe(false);
  });

  test("OUT with allowNegative bypasses the stock guard (reconciliation)", async () => {
    const { tx } = makeTx({ minStockAlert: null, startQuantity: 10 });

    const result = await applyStockMutation(tx, {
      itemId: ITEM,
      locationId: LOC,
      mutationType: StockMutationType.OUT_ADJUSTMENT,
      quantity: 25,
      allowNegative: true,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.newQuantity).toBe(-15);
    }
  });
});
