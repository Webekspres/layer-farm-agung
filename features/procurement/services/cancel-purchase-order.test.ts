import { beforeEach, describe, expect, mock, test } from "bun:test";
import {
  cancelPurchaseOrder,
  type CancelPurchaseOrderOptions,
} from "./cancel-purchase-order";

type PoRow = {
  id: string;
  status: string;
  purchase_order_items: { quantity_received: number }[];
};

type UpdateManyArgs = { where: Record<string, unknown>; data: { status: string } };

const findFirstPo = mock((_args: unknown) => Promise.resolve(null as PoRow | null));
const updateMany = mock((_args: UpdateManyArgs) => Promise.resolve({ count: 1 }));

const fakePrisma = {
  purchaseOrder: { findFirst: findFirstPo, updateMany },
};

const deps = {
  prisma: fakePrisma,
} as unknown as CancelPurchaseOrderOptions["deps"];

const BASE_PO: PoRow = {
  id: "po-1",
  status: "Pending",
  purchase_order_items: [{ quantity_received: 0 }, { quantity_received: 0 }],
};

describe("cancelPurchaseOrder", () => {
  beforeEach(() => {
    findFirstPo.mockReset();
    findFirstPo.mockResolvedValue(structuredClone(BASE_PO));
    updateMany.mockReset();
    updateMany.mockResolvedValue({ count: 1 });
  });

  test("fails when PO not found in tenant", async () => {
    findFirstPo.mockResolvedValue(null);

    const result = await cancelPurchaseOrder("tenant-1", { poId: "po-1" }, { deps });

    expect(result.ok).toBe(false);
    expect(updateMany).not.toHaveBeenCalled();
  });

  test("fails when PO is PartiallyReceived", async () => {
    findFirstPo.mockResolvedValue({ ...structuredClone(BASE_PO), status: "PartiallyReceived" });

    const result = await cancelPurchaseOrder("tenant-1", { poId: "po-1" }, { deps });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("belum ada penerimaan");
    expect(updateMany).not.toHaveBeenCalled();
  });

  test("fails when PO is Received", async () => {
    findFirstPo.mockResolvedValue({ ...structuredClone(BASE_PO), status: "Received" });

    const result = await cancelPurchaseOrder("tenant-1", { poId: "po-1" }, { deps });

    expect(result.ok).toBe(false);
    expect(updateMany).not.toHaveBeenCalled();
  });

  test("fails when PO is already Cancelled", async () => {
    findFirstPo.mockResolvedValue({ ...structuredClone(BASE_PO), status: "Cancelled" });

    const result = await cancelPurchaseOrder("tenant-1", { poId: "po-1" }, { deps });

    expect(result.ok).toBe(false);
    expect(updateMany).not.toHaveBeenCalled();
  });

  test("defensively rejects Pending POs that already have a received line (should not normally happen)", async () => {
    findFirstPo.mockResolvedValue({
      id: "po-1",
      status: "Pending",
      purchase_order_items: [{ quantity_received: 5 }],
    });

    const result = await cancelPurchaseOrder("tenant-1", { poId: "po-1" }, { deps });

    expect(result.ok).toBe(false);
    expect(updateMany).not.toHaveBeenCalled();
  });

  test("cancels a Pending PO with zero received quantity", async () => {
    const result = await cancelPurchaseOrder("tenant-1", { poId: "po-1" }, { deps });

    expect(result.ok).toBe(true);
    expect(updateMany).toHaveBeenCalledTimes(1);
    const [args] = updateMany.mock.calls[0];
    expect(args.where).toEqual({ id: "po-1", status: "Pending" });
    expect(args.data.status).toBe("Cancelled");
  });

  test("fails with a concurrency error when another process already changed the PO", async () => {
    updateMany.mockResolvedValue({ count: 0 });

    const result = await cancelPurchaseOrder("tenant-1", { poId: "po-1" }, { deps });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("proses lain");
  });
});
