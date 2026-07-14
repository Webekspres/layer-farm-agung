import { describe, expect, test } from "bun:test";
import { updateDailyProductionSchema } from "@/features/production/schemas/update-daily-production";

describe("updateDailyProductionSchema", () => {
  test("accepts valid TB/TR/TP update", () => {
    const result = updateDailyProductionSchema.safeParse({
      tb: 500,
      tr: 10,
      tp: 5,
    });
    expect(result.success).toBe(true);
  });

  test("rejects zero total", () => {
    const result = updateDailyProductionSchema.safeParse({
      tb: 0,
      tr: 0,
      tp: 0,
    });
    expect(result.success).toBe(false);
  });
});
