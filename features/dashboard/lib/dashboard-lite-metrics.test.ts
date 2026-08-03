import { describe, expect, test } from "bun:test";
import {
  buildCashWeekBalance,
  buildFcrSnapshot,
  buildMortalityWarnings,
  MORTALITY_WEEK_WARNING_THRESHOLD,
} from "./dashboard-lite-metrics";

describe("dashboard-lite-metrics", () => {
  test("buildFcrSnapshot uses feed/TB", () => {
    expect(buildFcrSnapshot(200, 100)).toBe(2);
    expect(buildFcrSnapshot(0, 100)).toBeNull();
  });

  test("buildMortalityWarnings keeps cages at or above threshold", () => {
    const warnings = buildMortalityWarnings([
      { cageId: "a", cageName: "A", deaths: 2 },
      { cageId: "b", cageName: "B", deaths: MORTALITY_WEEK_WARNING_THRESHOLD },
      { cageId: "c", cageName: "C", deaths: 12 },
    ]);
    expect(warnings.map((w) => w.cageId)).toEqual(["c", "b"]);
  });

  test("buildCashWeekBalance is income minus expense", () => {
    expect(buildCashWeekBalance(1_000_000, 250_000)).toBe(750_000);
  });
});
