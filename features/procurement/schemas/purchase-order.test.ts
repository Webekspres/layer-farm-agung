import { describe, expect, test } from "bun:test";

import {
  createPurchaseOrderSchema,
  receivePurchaseOrderSchema,
} from "@/features/procurement/schemas/purchase-order";

const ITEM_ID = "00000000-0000-4000-8000-000000000004";
const VENDOR_ID = "00000000-0000-4000-8000-000000000002";
const PO_ID = "00000000-0000-4000-8000-000000000001";
const LOC_ID = "00000000-0000-4000-8000-000000000003";

describe("createPurchaseOrderSchema", () => {
  test("accepts valid PO with one line", () => {
    const result = createPurchaseOrderSchema.safeParse({
      vendorId: VENDOR_ID,
      orderDate: "2026-07-09",
      items: [{ itemId: ITEM_ID, quantity: 100, unitPrice: 15000 }],
    });
    expect(result.success).toBe(true);
  });

  test("rejects empty items", () => {
    const result = createPurchaseOrderSchema.safeParse({
      vendorId: VENDOR_ID,
      orderDate: "2026-07-09",
      items: [],
    });
    expect(result.success).toBe(false);
  });
});

describe("receivePurchaseOrderSchema", () => {
  test("accepts valid receive payload", () => {
    const result = receivePurchaseOrderSchema.safeParse({
      poId: PO_ID,
      locationId: LOC_ID,
    });
    expect(result.success).toBe(true);
  });
});
