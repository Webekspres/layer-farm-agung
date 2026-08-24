import { describe, expect, test } from "bun:test";
import { updatePopulationMutationSchema } from "./update-population-mutation";

const reason = "Koreksi hitung ulang";

describe("updatePopulationMutationSchema", () => {
  test("accepts a valid mutation update with reason", () => {
    const result = updatePopulationMutationSchema.safeParse({
      mutationType: "Afkir",
      quantity: 4,
      notes: "Koreksi jenis mutasi",
      reason,
    });
    expect(result.success).toBe(true);
  });

  test("accepts reported zero mortality with reason", () => {
    const result = updatePopulationMutationSchema.safeParse({
      mutationType: "Mati",
      quantity: 0,
      reason,
    });
    expect(result.success).toBe(true);
  });

  test("rejects an invalid mutation type", () => {
    const result = updatePopulationMutationSchema.safeParse({
      mutationType: "Sembuh",
      quantity: 4,
      reason,
    });
    expect(result.success).toBe(false);
  });

  test("rejects missing reason", () => {
    const result = updatePopulationMutationSchema.safeParse({
      mutationType: "Mati",
      quantity: 2,
    });
    expect(result.success).toBe(false);
  });

  test("rejects negative quantity", () => {
    const result = updatePopulationMutationSchema.safeParse({
      mutationType: "Mati",
      quantity: -1,
      reason,
    });
    expect(result.success).toBe(false);
  });
});
