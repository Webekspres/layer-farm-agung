import { beforeEach, describe, expect, mock, test } from "bun:test";
import {
  receivePurchaseOrder,
  type ReceivePurchaseOrderOptions,
} from "./receive-purchase-order";
import { StockMutationType } from "@/features/inventory/lib/stock-mutation-types";
import type { ReceivePurchaseOrderInput } from "@/features/procurement/schemas/purchase-order";

/**
 * These tests inject fakes via `options.deps` rather than `mock.module`,
 * because Bun's `mock.module` replaces a module for the whole test run (no
 * per-file restore) and would otherwise break every other test importing the
 * real `@/lib/prisma` / `apply-stock-mutation`.
 */

type PoLineRow = {
  id: string;
  item_id: string;
  quantity: number;
  quantity_received: number;
};
type PoRow = { id: string; status: string; purchase_order_items: PoLineRow[] };

type StockMutationParams = {
  itemId: string;
  locationId: string;
  mutationType: string;
  quantity: number;
  referenceId: string;
};
type StockMutationResult =
  | { ok: true; newQuantity: number; lowStock: boolean; minStockAlert: number | null }
  | { ok: false; error: string };

type ItemUpdateArgs = {
  where: { id: string };
  data: { quantity_received: { increment: number } };
};
type PoUpdateManyArgs = { where: Record<string, unknown>; data: { status: string } };

const findFirstPo = mock((_args: unknown) => Promise.resolve(null as PoRow | null));
const findFirstLocation = mock((_args: unknown) =>
  Promise.resolve({ id: "loc-1" } as { id: string } | null),
);
const itemUpdate = mock((_args: ItemUpdateArgs) => Promise.resolve({}));
const itemFindMany = mock((_args: unknown) =>
  Promise.resolve([] as { quantity: number; quantity_received: number }[]),
);
const poUpdateMany = mock((_args: PoUpdateManyArgs) => Promise.resolve({ count: 1 }));

const applyStockMutation = mock(
  (_tx: unknown, _params: StockMutationParams): Promise<StockMutationResult> =>
    Promise.resolve({ ok: true, newQuantity: 100, lowStock: false, minStockAlert: null }),
);

const fakePrisma = {
  purchaseOrder: { findFirst: findFirstPo },
  location: { findFirst: findFirstLocation },
  $transaction: async (fn: (tx: unknown) => Promise<unknown>) =>
    fn({
      purchaseOrderItem: { update: itemUpdate, findMany: itemFindMany },
      purchaseOrder: { updateMany: poUpdateMany },
    }),
};

const deps = {
  prisma: fakePrisma,
  applyStockMutation,
} as unknown as ReceivePurchaseOrderOptions["deps"];

const BASE_PO: PoRow = {
  id: "po-1",
  status: "Pending",
  purchase_order_items: [
    { id: "line-1", item_id: "item-1", quantity: 100, quantity_received: 0 },
    { id: "line-2", item_id: "item-2", quantity: 50, quantity_received: 0 },
  ],
};

function baseInput(
  overrides: Partial<ReceivePurchaseOrderInput> = {},
): ReceivePurchaseOrderInput {
  return { poId: "po-1", locationId: "loc-1", ...overrides };
}

describe("receivePurchaseOrder", () => {
  beforeEach(() => {
    findFirstPo.mockReset();
    findFirstPo.mockResolvedValue(structuredClone(BASE_PO));
    findFirstLocation.mockReset();
    findFirstLocation.mockResolvedValue({ id: "loc-1" });
    itemUpdate.mockReset();
    itemUpdate.mockResolvedValue({});
    itemFindMany.mockReset();
    itemFindMany.mockResolvedValue([
      { quantity: 100, quantity_received: 100 },
      { quantity: 50, quantity_received: 50 },
    ]);
    poUpdateMany.mockReset();
    poUpdateMany.mockResolvedValue({ count: 1 });
    applyStockMutation.mockReset();
    applyStockMutation.mockResolvedValue({
      ok: true,
      newQuantity: 100,
      lowStock: false,
      minStockAlert: null,
    });
  });

  test("fails when PO not found in tenant", async () => {
    findFirstPo.mockResolvedValue(null);

    const result = await receivePurchaseOrder("tenant-1", baseInput(), { deps });

    expect(result.ok).toBe(false);
  });

  test("fails when PO is already fully Received", async () => {
    findFirstPo.mockResolvedValue({ ...structuredClone(BASE_PO), status: "Received" });

    const result = await receivePurchaseOrder("tenant-1", baseInput(), { deps });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("dibatalkan");
    expect(applyStockMutation).not.toHaveBeenCalled();
  });

  test("fails when PO is Cancelled", async () => {
    findFirstPo.mockResolvedValue({ ...structuredClone(BASE_PO), status: "Cancelled" });

    const result = await receivePurchaseOrder("tenant-1", baseInput(), { deps });

    expect(result.ok).toBe(false);
    expect(applyStockMutation).not.toHaveBeenCalled();
  });

  test("fails when location does not belong to the tenant", async () => {
    findFirstLocation.mockResolvedValue(null);

    const result = await receivePurchaseOrder("tenant-1", baseInput(), { deps });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("Lokasi");
  });

  test("fails when PO has no line items", async () => {
    findFirstPo.mockResolvedValue({ ...structuredClone(BASE_PO), purchase_order_items: [] });

    const result = await receivePurchaseOrder("tenant-1", baseInput(), { deps });

    expect(result.ok).toBe(false);
  });

  test("full receive (items omitted) applies IN_PURCHASE for every remaining line and marks Received", async () => {
    const result = await receivePurchaseOrder("tenant-1", baseInput(), { deps });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.status).toBe("Received");

    expect(applyStockMutation).toHaveBeenCalledTimes(2);
    const [, firstParams] = applyStockMutation.mock.calls[0];
    expect(firstParams.itemId).toBe("item-1");
    expect(firstParams.quantity).toBe(100);
    expect(firstParams.mutationType).toBe(StockMutationType.IN_PURCHASE);
    const [, secondParams] = applyStockMutation.mock.calls[1];
    expect(secondParams.itemId).toBe("item-2");
    expect(secondParams.quantity).toBe(50);

    expect(itemUpdate).toHaveBeenCalledTimes(2);
    expect(poUpdateMany).toHaveBeenCalledTimes(1);
    const [poUpdateArgs] = poUpdateMany.mock.calls[0];
    expect(poUpdateArgs.data.status).toBe("Received");
  });

  test("partial receive only applies stock mutation for the specified line and keeps PartiallyReceived", async () => {
    itemFindMany.mockResolvedValue([
      { quantity: 100, quantity_received: 40 },
      { quantity: 50, quantity_received: 0 },
    ]);

    const result = await receivePurchaseOrder(
      "tenant-1",
      baseInput({ items: [{ itemId: "item-1", quantity: 40 }] }),
      { deps },
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.status).toBe("PartiallyReceived");

    expect(applyStockMutation).toHaveBeenCalledTimes(1);
    const [, params] = applyStockMutation.mock.calls[0];
    expect(params.itemId).toBe("item-1");
    expect(params.quantity).toBe(40);

    expect(itemUpdate).toHaveBeenCalledTimes(1);
    const [updateArgs] = itemUpdate.mock.calls[0];
    expect(updateArgs.where.id).toBe("line-1");
    expect(updateArgs.data.quantity_received.increment).toBe(40);
  });

  test("a second partial receive that completes every line marks the PO Received", async () => {
    findFirstPo.mockResolvedValue({
      id: "po-1",
      status: "PartiallyReceived",
      purchase_order_items: [
        { id: "line-1", item_id: "item-1", quantity: 100, quantity_received: 40 },
        { id: "line-2", item_id: "item-2", quantity: 50, quantity_received: 50 },
      ],
    });
    itemFindMany.mockResolvedValue([
      { quantity: 100, quantity_received: 100 },
      { quantity: 50, quantity_received: 50 },
    ]);

    const result = await receivePurchaseOrder(
      "tenant-1",
      baseInput({ items: [{ itemId: "item-1", quantity: 60 }] }),
      { deps },
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.status).toBe("Received");
    expect(applyStockMutation).toHaveBeenCalledTimes(1);
    const [, params] = applyStockMutation.mock.calls[0];
    expect(params.quantity).toBe(60);
  });

  test("rejects a requested quantity greater than the remaining amount", async () => {
    const result = await receivePurchaseOrder(
      "tenant-1",
      baseInput({ items: [{ itemId: "item-1", quantity: 999 }] }),
      { deps },
    );

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("melebihi");
    expect(applyStockMutation).not.toHaveBeenCalled();
  });

  test("rejects when every requested quantity is 0", async () => {
    const result = await receivePurchaseOrder(
      "tenant-1",
      baseInput({ items: [{ itemId: "item-1", quantity: 0 }, { itemId: "item-2", quantity: 0 }] }),
      { deps },
    );

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("Masukkan jumlah");
    expect(applyStockMutation).not.toHaveBeenCalled();
  });

  test("fails without updating stock when a stock mutation is rejected", async () => {
    applyStockMutation.mockResolvedValue({
      ok: false,
      error: "Item inventori tidak ditemukan.",
    });

    const result = await receivePurchaseOrder("tenant-1", baseInput(), { deps });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("tidak ditemukan");
    expect(itemUpdate).not.toHaveBeenCalled();
  });

  test("fails with a concurrency error when the PO status changed underneath it", async () => {
    poUpdateMany.mockResolvedValue({ count: 0 });

    const result = await receivePurchaseOrder("tenant-1", baseInput(), { deps });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("proses lain");
  });
});
