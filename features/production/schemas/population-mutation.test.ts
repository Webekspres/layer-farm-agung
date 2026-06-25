import { describe, expect, test } from "bun:test";
import { populationMutationSchema } from "./population-mutation";

const validUuid = "550e8400-e29b-41d4-a716-446655440000";

describe("populationMutationSchema", () => {
  test("accepts valid population mutation payload", () => {
    const result = populationMutationSchema.safeParse({
      cageId: validUuid,
      mutationType: "Mati",
      quantity: "5",
      notes: "Sakit",
      recordDate: "2026-06-25",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.mutationType).toBe("Mati");
      expect(result.data.quantity).toBe(5);
    }
  });

  test("rejects invalid mutation type", () => {
    const result = populationMutationSchema.safeParse({
      cageId: validUuid,
      mutationType: "Sakit", // not in POPULATION_MUTATION_TYPES
      quantity: 5,
      recordDate: "2026-06-25",
    });
    expect(result.success).toBe(false);
  });
});
