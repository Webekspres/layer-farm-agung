import { describe, expect, test } from "bun:test";
import {
  aggregateMutationTotals,
  computeAverageHdpForPeriod,
  computeCapacityPercent,
  computeCrackRatio,
  computeFcr,
  sumProductionInPeriod,
} from "@/features/cages/lib/cycle-operational-metrics";

describe("cycle-operational-metrics", () => {
  const start = new Date("2026-07-01T00:00:00.000Z");
  const end = new Date("2026-07-10T00:00:00.000Z");

  test("aggregateMutationTotals filters by period", () => {
    const totals = aggregateMutationTotals(
      [
        {
          mutation_type: "Mati",
          quantity: 10,
          record_date: new Date("2026-07-05T00:00:00.000Z"),
        },
        {
          mutation_type: "Masuk",
          quantity: 50,
          record_date: new Date("2026-07-08T00:00:00.000Z"),
        },
        {
          mutation_type: "Mati",
          quantity: 99,
          record_date: new Date("2026-06-20T00:00:00.000Z"),
        },
      ],
      start,
      end,
    );

    expect(totals).toEqual({ masuk: 50, mati: 10, afkir: 0, pindah: 0 });
  });

  test("computeFcr returns feed per TB", () => {
    expect(computeFcr(200, 100)).toBe(2);
    expect(computeFcr(0, 100)).toBeNull();
    expect(computeFcr(100, 0)).toBeNull();
  });

  test("computeCrackRatio", () => {
    expect(computeCrackRatio(90, 5, 5)).toBe(0.1);
    expect(computeCrackRatio(0, 0, 0)).toBeNull();
  });

  test("computeCapacityPercent", () => {
    expect(computeCapacityPercent(4000, 5000)).toBe(80);
    expect(computeCapacityPercent(100, 0)).toBeNull();
  });

  test("sumProductionInPeriod", () => {
    const result = sumProductionInPeriod(
      [
        {
          record_date: new Date("2026-07-03T00:00:00.000Z"),
          tb: 100,
          tr: 5,
          tp: 2,
        },
        {
          record_date: new Date("2026-07-09T00:00:00.000Z"),
          tb: 120,
          tr: 3,
          tp: 1,
        },
      ],
      start,
      end,
    );

    expect(result).toEqual({ tb: 220, tr: 8, tp: 3 });
  });

  test("computeAverageHdpForPeriod averages daily HDP", () => {
    const average = computeAverageHdpForPeriod(
      1000,
      [
        {
          mutation_type: "Mati",
          quantity: 100,
          record_date: new Date("2026-07-02T00:00:00.000Z"),
        },
      ],
      [
        {
          record_date: new Date("2026-07-05T00:00:00.000Z"),
          tb: 90,
          tr: 0,
          tp: 0,
        },
        {
          record_date: new Date("2026-07-06T00:00:00.000Z"),
          tb: 81,
          tr: 0,
          tp: 0,
        },
      ],
      start,
      end,
    );

    expect(average).not.toBeNull();
    expect(average!).toBeGreaterThan(0);
  });
});
