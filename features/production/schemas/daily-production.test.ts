import { describe, expect, test } from "bun:test";
import { dailyProductionSchema } from "@/features/production/schemas/daily-production";

const validUuid = "550e8400-e29b-41d4-a716-446655440000";

describe("dailyProductionSchema", () => {
  test("accepts valid payload", () => {
    const result = dailyProductionSchema.safeParse({
      cageId: validUuid,
      eggGradeId: "1",
      recordDate: "2026-05-19",
      quantity: "1200",
      eggCrack: "30",
      weight: "72.5",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.quantity).toBe(1200);
      expect(result.data.eggCrack).toBe(30);
      expect(result.data.weight).toBe(72.5);
    }
  });

  test("rejects negative quantity", () => {
    const result = dailyProductionSchema.safeParse({
      cageId: validUuid,
      eggGradeId: 1,
      recordDate: "2026-05-19",
      quantity: -1,
      eggCrack: 0,
    });
    expect(result.success).toBe(false);
  });

  test("rejects quantity over cap", () => {
    const result = dailyProductionSchema.safeParse({
      cageId: validUuid,
      eggGradeId: 1,
      recordDate: "2026-05-19",
      quantity: 10_001,
      eggCrack: 0,
    });
    expect(result.success).toBe(false);
  });

  test("rejects zero total harvest", () => {
    const result = dailyProductionSchema.safeParse({
      cageId: validUuid,
      eggGradeId: 1,
      recordDate: "2026-05-19",
      quantity: 0,
      eggCrack: 0,
    });
    expect(result.success).toBe(false);
  });
});
