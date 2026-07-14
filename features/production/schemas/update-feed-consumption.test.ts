import { describe, expect, test } from "bun:test";
import { updateFeedConsumptionSchema } from "./update-feed-consumption";

describe("updateFeedConsumptionSchema", () => {
  test("accepts a valid quantity update", () => {
    const result = updateFeedConsumptionSchema.safeParse({
      quantity: "30.5",
      notes: "Koreksi jumlah",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.quantity).toBe(30.5);
    }
  });

  test("rejects zero or negative quantity", () => {
    const result = updateFeedConsumptionSchema.safeParse({ quantity: 0 });
    expect(result.success).toBe(false);
  });
});
