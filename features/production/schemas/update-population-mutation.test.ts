import { describe, expect, test } from "bun:test";
import { updatePopulationMutationSchema } from "./update-population-mutation";

describe("updatePopulationMutationSchema", () => {
  test("accepts a valid mutation update", () => {
    const result = updatePopulationMutationSchema.safeParse({
      mutationType: "Afkir",
      quantity: 4,
      notes: "Koreksi jenis mutasi",
    });
    expect(result.success).toBe(true);
  });

  test("rejects an invalid mutation type", () => {
    const result = updatePopulationMutationSchema.safeParse({
      mutationType: "Sembuh",
      quantity: 4,
    });
    expect(result.success).toBe(false);
  });

  test("rejects non-positive quantity", () => {
    const result = updatePopulationMutationSchema.safeParse({
      mutationType: "Mati",
      quantity: 0,
    });
    expect(result.success).toBe(false);
  });
});
