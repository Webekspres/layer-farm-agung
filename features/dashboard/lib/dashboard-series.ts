import {
  formatBusinessDate,
  shiftBusinessDate,
} from "@/lib/business-date";
import type {
  DashboardKpi,
  TrendDirection,
} from "@/features/dashboard/lib/dashboard-executive-types";

/** Inclusive calendar window ending at `end`, length = `days`. */
export function enumerateBusinessDates(end: Date, days: number): Date[] {
  const safeDays = Math.max(1, days);
  return Array.from({ length: safeDays }, (_, index) =>
    shiftBusinessDate(end, -(safeDays - 1 - index)),
  );
}

export function shortDateLabel(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export function toDateKeyMap(
  rows: { date: Date; value: number }[],
): Map<string, number> {
  const map = new Map<string, number>();
  for (const row of rows) {
    const key = formatBusinessDate(row.date);
    map.set(key, (map.get(key) ?? 0) + row.value);
  }
  return map;
}

export function fillSeries(
  dates: Date[],
  keyed: Map<string, number>,
): { date: string; label: string; value: number }[] {
  return dates.map((date) => {
    const key = formatBusinessDate(date);
    return {
      date: key,
      label: shortDateLabel(date),
      value: keyed.get(key) ?? 0,
    };
  });
}

export function seriesHasSignal(
  points: { value: number }[],
  threshold = 0,
): boolean {
  return points.some((point) => point.value > threshold);
}

export function computeDeltaPercent(
  current: number,
  previous: number,
): number | null {
  if (previous === 0) {
    if (current === 0) return 0;
    return null;
  }
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function resolveTrend(
  delta: number | null,
  epsilon = 0.0001,
): TrendDirection {
  if (delta == null || Math.abs(delta) < epsilon) return "flat";
  return delta > 0 ? "up" : "down";
}

export function buildKpi(input: {
  id: string;
  label: string;
  value: number | null;
  previous: number | null;
  format: DashboardKpi["format"];
  unit?: string;
  comparisonLabel: string;
  sparkline: number[];
  invertTrend?: boolean;
}): DashboardKpi {
  const current = input.value;
  const previous = input.previous;
  const delta =
    current == null || previous == null ? null : current - previous;
  const deltaPercent =
    current == null || previous == null
      ? null
      : computeDeltaPercent(current, previous);

  return {
    id: input.id,
    label: input.label,
    value: current,
    unit: input.unit,
    format: input.format,
    delta,
    deltaPercent,
    direction: resolveTrend(delta),
    invertTrend: input.invertTrend,
    comparisonLabel: input.comparisonLabel,
    sparkline: input.sparkline,
  };
}

/** Simple seeded pseudo-random in [0, 1) for stable demo series. */
export function seededUnit(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export function buildDemoWave(
  dates: Date[],
  base: number,
  amplitude: number,
  seedOffset = 1,
): number[] {
  return dates.map((date, index) => {
    const wobble = seededUnit(seedOffset + index + date.getUTCDate());
    const seasonal = Math.sin((index / dates.length) * Math.PI * 2) * 0.35;
    return Math.max(
      0,
      Math.round(base + amplitude * (seasonal + (wobble - 0.5))),
    );
  });
}
