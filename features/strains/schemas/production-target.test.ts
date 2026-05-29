import { describe, expect, test } from "bun:test";
import { productionTargetSchema } from "@/features/strains/schemas/strain";

describe("productionTargetSchema", () => {
  test("accepts valid inputs", () => {
    const result = productionTargetSchema.safeParse({
      strainId: "1",
      ageInWeeks: "18",
      targetHdp: "90.5",
      targetFcr: "2.15",
    });
    expect(result.success).toBe(true);
  });

  test("rejects invalid HDP", () => {
    const result = productionTargetSchema.safeParse({
      strainId: "1",
      ageInWeeks: "18",
      targetHdp: "101.5",
      targetFcr: "2.15",
    });
    expect(result.success).toBe(false);
  });

  test("rejects negative FCR", () => {
    const result = productionTargetSchema.safeParse({
      strainId: "1",
      ageInWeeks: "18",
      targetHdp: "90.5",
      targetFcr: "-0.5",
    });
    expect(result.success).toBe(false);
  });
});
