import { describe, expect, test } from "bun:test";
import { populationMutationSchema } from "./population-mutation";

const validUuid = "550e8400-e29b-41d4-a716-446655440000";
const otherUuid = "660e8400-e29b-41d4-a716-446655440001";

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

  test("requires targetCageId when mutationType is Pindah", () => {
    const result = populationMutationSchema.safeParse({
      cageId: validUuid,
      mutationType: "Pindah",
      quantity: 5,
      recordDate: "2026-06-25",
    });
    expect(result.success).toBe(false);
  });

  test("rejects targetCageId equal to cageId for Pindah", () => {
    const result = populationMutationSchema.safeParse({
      cageId: validUuid,
      mutationType: "Pindah",
      quantity: 5,
      recordDate: "2026-06-25",
      targetCageId: validUuid,
    });
    expect(result.success).toBe(false);
  });

  test("accepts Pindah with a valid, different targetCageId", () => {
    const result = populationMutationSchema.safeParse({
      cageId: validUuid,
      mutationType: "Pindah",
      quantity: 5,
      recordDate: "2026-06-25",
      targetCageId: otherUuid,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.targetCageId).toBe(otherUuid);
    }
  });

  test("ignores targetCageId for non-Pindah mutation types", () => {
    const result = populationMutationSchema.safeParse({
      cageId: validUuid,
      mutationType: "Mati",
      quantity: 5,
      recordDate: "2026-06-25",
    });
    expect(result.success).toBe(true);
  });
});
