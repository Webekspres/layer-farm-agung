import { describe, expect, test } from "bun:test";

import { createSalesOrderSchema } from "./sales-order";

const CUSTOMER_ID = "00000000-0000-4000-8000-000000000010";

describe("createSalesOrderSchema", () => {
  test("accepts a valid sales order with one line", () => {
    const result = createSalesOrderSchema.safeParse({
      customerId: CUSTOMER_ID,
      saleDate: "2026-07-09",
      items: [{ eggGradeId: 1, quantity: 100, weight: 6.5, unitPrice: 2000 }],
    });
    expect(result.success).toBe(true);
  });

  test("rejects an order with no line items", () => {
    const result = createSalesOrderSchema.safeParse({
      customerId: CUSTOMER_ID,
      saleDate: "2026-07-09",
      items: [],
    });
    expect(result.success).toBe(false);
  });

  test("rejects a non-positive quantity", () => {
    const result = createSalesOrderSchema.safeParse({
      customerId: CUSTOMER_ID,
      saleDate: "2026-07-09",
      items: [{ eggGradeId: 1, quantity: 0, weight: 6.5, unitPrice: 2000 }],
    });
    expect(result.success).toBe(false);
  });

  test("rejects a negative unit price", () => {
    const result = createSalesOrderSchema.safeParse({
      customerId: CUSTOMER_ID,
      saleDate: "2026-07-09",
      items: [{ eggGradeId: 1, quantity: 10, weight: 6.5, unitPrice: -1 }],
    });
    expect(result.success).toBe(false);
  });

  test("rejects a future sale date", () => {
    const future = new Date();
    future.setUTCDate(future.getUTCDate() + 5);
    const iso = future.toISOString().slice(0, 10);

    const result = createSalesOrderSchema.safeParse({
      customerId: CUSTOMER_ID,
      saleDate: iso,
      items: [{ eggGradeId: 1, quantity: 10, weight: 6.5, unitPrice: 2000 }],
    });
    expect(result.success).toBe(false);
  });
});
