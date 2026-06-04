import { describe, expect, test } from "bun:test";
import { crackRatioExceedsThreshold } from "@/features/production/lib/crack-ratio";

describe("crackRatioExceedsThreshold", () => {
  test("returns false when total is zero", () => {
    expect(crackRatioExceedsThreshold(0, 0)).toBe(false);
  });

  test("returns false at exactly 5%", () => {
    expect(crackRatioExceedsThreshold(95, 5)).toBe(false);
  });

  test("returns true above 5%", () => {
    expect(crackRatioExceedsThreshold(90, 10)).toBe(true);
  });
});
