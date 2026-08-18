import { describe, expect, test } from "bun:test";

import { eggGradeSchema } from "@/features/egg-grades/schemas/egg-grade";

const base = { name: "Grade A", isActive: true, sortOrder: 0 };

describe("eggGradeSchema", () => {
  test("accepts single-letter grade names from seed", () => {
    const result = eggGradeSchema.safeParse({ ...base, name: "A" });
    expect(result.success).toBe(true);
  });

  test("rejects empty name", () => {
    const result = eggGradeSchema.safeParse({ ...base, name: "   " });
    expect(result.success).toBe(false);
  });

  test("uppercases and trims code", () => {
    const result = eggGradeSchema.safeParse({ ...base, code: " tb " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.code).toBe("TB");
    }
  });

  test("rejects code with spaces or symbols", () => {
    const result = eggGradeSchema.safeParse({ ...base, code: "TB B" });
    expect(result.success).toBe(false);
  });

  test("allows empty code (sales-label grade)", () => {
    const result = eggGradeSchema.safeParse({ ...base, code: "" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.code).toBeUndefined();
    }
  });
});
