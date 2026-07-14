import { describe, expect, test } from "bun:test";
import { crackRatioExceedsThreshold } from "@/features/production/lib/crack-ratio";

describe("crackRatioExceedsThreshold", () => {
  test("returns false when total is zero", () => {
    expect(crackRatioExceedsThreshold(0, 0, 0)).toBe(false);
  });

  test("returns false at exactly 5% defect (TR+TP)", () => {
    expect(crackRatioExceedsThreshold(19, 1, 0)).toBe(false);
  });

  test("returns true above 5% defect", () => {
    expect(crackRatioExceedsThreshold(80, 10, 10)).toBe(true);
  });
});
