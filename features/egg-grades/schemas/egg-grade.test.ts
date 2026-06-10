import { describe, expect, test } from "bun:test";

import { eggGradeSchema } from "@/features/egg-grades/schemas/egg-grade";

describe("eggGradeSchema", () => {
  test("accepts single-letter grade names from seed", () => {
    const result = eggGradeSchema.safeParse({ name: "A" });
    expect(result.success).toBe(true);
  });

  test("rejects empty name", () => {
    const result = eggGradeSchema.safeParse({ name: "   " });
    expect(result.success).toBe(false);
  });
});
