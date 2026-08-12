import { describe, expect, test } from "bun:test";
import { updateDailyProductionSchema } from "@/features/production/schemas/update-daily-production";

const reason = "Salah hitung pagi";

describe("updateDailyProductionSchema", () => {
  test("accepts valid TB/TR/TP update with reason", () => {
    const result = updateDailyProductionSchema.safeParse({
      tb: 500,
      tr: 10,
      tp: 5,
      reason,
    });
    expect(result.success).toBe(true);
  });

  test("rejects missing reason", () => {
    const result = updateDailyProductionSchema.safeParse({
      tb: 500,
      tr: 10,
      tp: 5,
    });
    expect(result.success).toBe(false);
  });

  test("rejects short reason", () => {
    const result = updateDailyProductionSchema.safeParse({
      tb: 500,
      tr: 0,
      tp: 0,
      reason: "ab",
    });
    expect(result.success).toBe(false);
  });

  test("rejects zero total even with reason", () => {
    const result = updateDailyProductionSchema.safeParse({
      tb: 0,
      tr: 0,
      tp: 0,
      reason,
    });
    expect(result.success).toBe(false);
  });
});
