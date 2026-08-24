import { describe, expect, test } from "bun:test";
import { updateDailyProductionSchema } from "@/features/production/schemas/update-daily-production";

const reason = "Salah hitung pagi";

const base = {
  entries: [
    { eggGradeId: 1, quantity: 500 },
    { eggGradeId: 2, quantity: 10 },
    { eggGradeId: 3, quantity: 5 },
  ],
};

describe("updateDailyProductionSchema", () => {
  test("accepts valid grade entries update with reason", () => {
    const result = updateDailyProductionSchema.safeParse({
      ...base,
      weight: 60,
      reason,
    });
    expect(result.success).toBe(true);
  });

  test("rejects missing reason", () => {
    const result = updateDailyProductionSchema.safeParse({ ...base });
    expect(result.success).toBe(false);
  });

  test("rejects short reason", () => {
    const result = updateDailyProductionSchema.safeParse({
      ...base,
      reason: "ab",
    });
    expect(result.success).toBe(false);
  });

  test("rejects duplicate grade entries even with reason", () => {
    const result = updateDailyProductionSchema.safeParse({
      entries: [
        { eggGradeId: 1, quantity: 100 },
        { eggGradeId: 1, quantity: 200 },
      ],
      reason,
    });
    expect(result.success).toBe(false);
  });
});
