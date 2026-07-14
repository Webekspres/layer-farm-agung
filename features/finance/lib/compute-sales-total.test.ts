import { describe, expect, test } from "bun:test";

import { computeSalesOrderTotal } from "./compute-sales-total";

describe("computeSalesOrderTotal", () => {
  test("sums quantity × unit price across lines", () => {
    const total = computeSalesOrderTotal([
      { quantity: 100, unitPrice: 2000 },
      { quantity: 50, unitPrice: 2500 },
    ]);
    expect(total).toBe(325_000);
  });

  test("returns 0 for an empty list", () => {
    expect(computeSalesOrderTotal([])).toBe(0);
  });

  test("handles a single line", () => {
    const total = computeSalesOrderTotal([{ quantity: 10, unitPrice: 1500 }]);
    expect(total).toBe(15_000);
  });

  test("ignores weight — total is quantity-based, not weight-based", () => {
    const total = computeSalesOrderTotal([{ quantity: 30, unitPrice: 1000 }]);
    expect(total).toBe(30_000);
  });
});
