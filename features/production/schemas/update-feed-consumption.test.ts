import { describe, expect, test } from "bun:test";
import { updateFeedConsumptionSchema } from "./update-feed-consumption";

const reason = "Koreksi timbang ulang";

describe("updateFeedConsumptionSchema", () => {
  test("accepts a valid quantity update with reason", () => {
    const result = updateFeedConsumptionSchema.safeParse({
      quantity: "30.5",
      notes: "Koreksi jumlah",
      reason,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.quantity).toBe(30.5);
    }
  });

  test("accepts explicit zero quantity with reason", () => {
    const result = updateFeedConsumptionSchema.safeParse({
      quantity: 0,
      reason,
    });
    expect(result.success).toBe(true);
  });

  test("rejects missing reason", () => {
    const result = updateFeedConsumptionSchema.safeParse({ quantity: 10 });
    expect(result.success).toBe(false);
  });

  test("rejects negative quantity", () => {
    const result = updateFeedConsumptionSchema.safeParse({
      quantity: -1,
      reason,
    });
    expect(result.success).toBe(false);
  });
});
