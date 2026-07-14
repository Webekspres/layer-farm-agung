import { describe, expect, test } from "bun:test";

import { computeHdpPercent } from "@/features/production/lib/compute-hdp";

describe("computeHdpPercent", () => {
  test("computes HDP from TB and population", () => {
    expect(computeHdpPercent(4500, 5000)).toBe(90);
  });

  test("returns null when population is zero", () => {
    expect(computeHdpPercent(100, 0)).toBeNull();
  });
});
