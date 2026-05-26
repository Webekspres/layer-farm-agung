import { describe, expect, test } from "bun:test";
import { cageSchema, updateCageSchema } from "@/features/cages/schemas/cage";

describe("cageSchema", () => {
  test("accepts create without cycle fields", () => {
    const result = cageSchema.safeParse({
      locationId: "00000000-0000-4000-8000-000000000001",
      strainId: "1",
      name: "Kandang A",
      capacity: "1000",
      status: "Active",
    });
    expect(result.success).toBe(true);
  });

  test("requires both cycle fields when one is set", () => {
    const result = cageSchema.safeParse({
      locationId: "00000000-0000-4000-8000-000000000001",
      strainId: "1",
      name: "Kandang A",
      capacity: "1000",
      cycleStartDate: "2025-01-01",
    });
    expect(result.success).toBe(false);
  });

  test("updateCageSchema omits cycle fields", () => {
    const result = updateCageSchema.safeParse({
      id: "00000000-0000-4000-8000-000000000002",
      locationId: "00000000-0000-4000-8000-000000000001",
      strainId: "1",
      name: "Kandang B",
      capacity: "2000",
      status: "Active",
    });
    expect(result.success).toBe(true);
  });
});
