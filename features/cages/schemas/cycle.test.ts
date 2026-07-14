import { describe, expect, test } from "bun:test";
import { createCycleSchema, closeCycleSchema } from "@/features/cages/schemas/cycle";

describe("createCycleSchema", () => {
  test("accepts valid inputs", () => {
    const result = createCycleSchema.safeParse({
      cageId: "00000000-0000-4000-8000-000000000001",
      startDate: "2026-05-28",
      initialPopulation: "500",
    });
    expect(result.success).toBe(true);
  });

  test("rejects future startDate", () => {
    const result = createCycleSchema.safeParse({
      cageId: "00000000-0000-4000-8000-000000000001",
      startDate: "2028-12-31",
      initialPopulation: "500",
    });
    expect(result.success).toBe(false);
  });

  test("rejects invalid population", () => {
    const result = createCycleSchema.safeParse({
      cageId: "00000000-0000-4000-8000-000000000001",
      startDate: "2026-05-28",
      initialPopulation: "0",
    });
    expect(result.success).toBe(false);
  });
});

describe("closeCycleSchema", () => {
  test("accepts valid inputs", () => {
    const result = closeCycleSchema.safeParse({
      cycleId: "00000000-0000-4000-8000-000000000002",
      endDate: "2026-05-29",
    });
    expect(result.success).toBe(true);
  });

  test("rejects invalid cycleId", () => {
    const result = closeCycleSchema.safeParse({
      cycleId: "invalid-uuid",
      endDate: "2026-05-29",
    });
    expect(result.success).toBe(false);
  });
});
