import { expect, test, describe } from "bun:test";
import {
  buildKpi,
  computeDeltaPercent,
  enumerateBusinessDates,
  fillSeries,
  resolveTrend,
  seriesHasSignal,
  toDateKeyMap,
} from "@/features/dashboard/lib/dashboard-series";

describe("dashboard-series", () => {
  test("enumerateBusinessDates returns inclusive window ending at end", () => {
    const end = new Date(Date.UTC(2026, 6, 14));
    const dates = enumerateBusinessDates(end, 7);
    expect(dates).toHaveLength(7);
    expect(dates[0]!.toISOString().slice(0, 10)).toBe("2026-07-08");
    expect(dates[6]!.toISOString().slice(0, 10)).toBe("2026-07-14");
  });

  test("fillSeries maps missing days to zero", () => {
    const end = new Date(Date.UTC(2026, 6, 14));
    const dates = enumerateBusinessDates(end, 3);
    const keyed = toDateKeyMap([
      { date: dates[2]!, value: 100 },
      { date: dates[2]!, value: 50 },
    ]);
    const series = fillSeries(dates, keyed);
    expect(series.map((p) => p.value)).toEqual([0, 0, 150]);
  });

  test("computeDeltaPercent and resolveTrend", () => {
    expect(computeDeltaPercent(110, 100)).toBeCloseTo(10);
    expect(computeDeltaPercent(0, 0)).toBe(0);
    expect(computeDeltaPercent(10, 0)).toBeNull();
    expect(resolveTrend(5)).toBe("up");
    expect(resolveTrend(-2)).toBe("down");
    expect(resolveTrend(0)).toBe("flat");
  });

  test("seriesHasSignal", () => {
    expect(seriesHasSignal([{ value: 0 }, { value: 0 }])).toBe(false);
    expect(seriesHasSignal([{ value: 0 }, { value: 1 }])).toBe(true);
  });

  test("buildKpi marks inverted trends for FCR-like metrics", () => {
    const kpi = buildKpi({
      id: "fcr",
      label: "FCR",
      value: 0.12,
      previous: 0.14,
      format: "fcr",
      comparisonLabel: "vs kemarin",
      sparkline: [0.14, 0.13, 0.12],
      invertTrend: true,
    });
    expect(kpi.direction).toBe("down");
    expect(kpi.invertTrend).toBe(true);
    expect(kpi.delta).toBeCloseTo(-0.02);
  });
});
