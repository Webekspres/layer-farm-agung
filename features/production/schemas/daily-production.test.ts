import { describe, expect, test } from "bun:test";
import { dailyProductionSchema } from "@/features/production/schemas/daily-production";

const validUuid = "550e8400-e29b-41d4-a716-446655440000";

const base = {
  cageId: validUuid,
  recordDate: "2026-05-19",
  entries: [
    { eggGradeId: 1, quantity: 1200 },
    { eggGradeId: 2, quantity: 30 },
    { eggGradeId: 3, quantity: 15 },
  ],
};

describe("dailyProductionSchema", () => {
  test("accepts valid grade entries payload with weight", () => {
    const result = dailyProductionSchema.safeParse({
      ...base,
      weight: "62.5",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.entries).toHaveLength(3);
      expect(result.data.entries[0]).toEqual({ eggGradeId: 1, quantity: 1200 });
      expect(result.data.weight).toBe(62.5);
    }
  });

  test("rejects negative quantity", () => {
    const result = dailyProductionSchema.safeParse({
      ...base,
      entries: [{ eggGradeId: 1, quantity: -1 }],
    });
    expect(result.success).toBe(false);
  });

  test("rejects count over cap", () => {
    const result = dailyProductionSchema.safeParse({
      ...base,
      entries: [{ eggGradeId: 1, quantity: 10_001 }],
    });
    expect(result.success).toBe(false);
  });

  test("rejects zero quantity per entry", () => {
    const result = dailyProductionSchema.safeParse({
      ...base,
      entries: [{ eggGradeId: 1, quantity: 0 }],
    });
    expect(result.success).toBe(false);
  });

  test("rejects duplicate grade entries", () => {
    const result = dailyProductionSchema.safeParse({
      ...base,
      entries: [
        { eggGradeId: 1, quantity: 100 },
        { eggGradeId: 1, quantity: 200 },
      ],
    });
    expect(result.success).toBe(false);
  });

  test("rejects empty entries", () => {
    const result = dailyProductionSchema.safeParse({
      ...base,
      entries: [],
    });
    expect(result.success).toBe(false);
  });
});
