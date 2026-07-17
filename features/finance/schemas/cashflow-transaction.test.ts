import { describe, expect, test } from "bun:test";

import { createCashflowTransactionSchema } from "./cashflow-transaction";

describe("createCashflowTransactionSchema", () => {
  test("accepts an Income transaction without a category", () => {
    const result = createCashflowTransactionSchema.safeParse({
      transactionDate: "2026-07-09",
      type: "Income",
      amount: 500_000,
    });
    expect(result.success).toBe(true);
  });

  test("accepts an Expense transaction with a category", () => {
    const result = createCashflowTransactionSchema.safeParse({
      transactionDate: "2026-07-09",
      type: "Expense",
      categoryId: 1,
      amount: 250_000,
    });
    expect(result.success).toBe(true);
  });

  test("rejects an Expense transaction without a category", () => {
    const result = createCashflowTransactionSchema.safeParse({
      transactionDate: "2026-07-09",
      type: "Expense",
      amount: 250_000,
    });
    expect(result.success).toBe(false);
  });

  test("rejects a non-positive amount", () => {
    const result = createCashflowTransactionSchema.safeParse({
      transactionDate: "2026-07-09",
      type: "Income",
      amount: 0,
    });
    expect(result.success).toBe(false);
  });

  test("rejects an invalid type", () => {
    const result = createCashflowTransactionSchema.safeParse({
      transactionDate: "2026-07-09",
      type: "Transfer",
      amount: 1000,
    });
    expect(result.success).toBe(false);
  });
});
