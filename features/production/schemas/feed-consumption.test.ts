import { describe, expect, test } from "bun:test";
import { feedConsumptionSchema } from "./feed-consumption";

const validUuid = "550e8400-e29b-41d4-a716-446655440000";

describe("feedConsumptionSchema", () => {
  test("accepts valid feed consumption payload", () => {
    const result = feedConsumptionSchema.safeParse({
      cageId: validUuid,
      itemId: validUuid,
      recordDate: "2026-06-25",
      quantity: "25.5",
      notes: "Habis semua",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.quantity).toBe(25.5);
      expect(result.data.notes).toBe("Habis semua");
    }
  });

  test("rejects negative quantity", () => {
    const result = feedConsumptionSchema.safeParse({
      cageId: validUuid,
      itemId: validUuid,
      recordDate: "2026-06-25",
      quantity: -5,
    });
    expect(result.success).toBe(false);
  });
});
