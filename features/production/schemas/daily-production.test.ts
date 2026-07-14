import { describe, expect, test } from "bun:test";
import { dailyProductionSchema } from "@/features/production/schemas/daily-production";

const validUuid = "550e8400-e29b-41d4-a716-446655440000";

describe("dailyProductionSchema", () => {
  test("accepts valid TB/TR/TP payload", () => {
    const result = dailyProductionSchema.safeParse({
      cageId: validUuid,
      recordDate: "2026-05-19",
      tb: "1200",
      tr: "30",
      tp: "15",
      weight: "72.5",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tb).toBe(1200);
      expect(result.data.tr).toBe(30);
      expect(result.data.tp).toBe(15);
      expect(result.data.weight).toBe(72.5);
    }
  });

  test("rejects negative tb", () => {
    const result = dailyProductionSchema.safeParse({
      cageId: validUuid,
      recordDate: "2026-05-19",
      tb: -1,
      tr: 0,
      tp: 0,
    });
    expect(result.success).toBe(false);
  });

  test("rejects count over cap", () => {
    const result = dailyProductionSchema.safeParse({
      cageId: validUuid,
      recordDate: "2026-05-19",
      tb: 10_001,
      tr: 0,
      tp: 0,
    });
    expect(result.success).toBe(false);
  });

  test("rejects zero total harvest", () => {
    const result = dailyProductionSchema.safeParse({
      cageId: validUuid,
      recordDate: "2026-05-19",
      tb: 0,
      tr: 0,
      tp: 0,
    });
    expect(result.success).toBe(false);
  });
});
