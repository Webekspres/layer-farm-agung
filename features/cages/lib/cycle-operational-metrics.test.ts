import { describe, expect, test } from "bun:test";
import { normalizeBusinessDate } from "@/lib/business-date";
import {
  computeCrackRatio,
  computeFcr,
  hasProductionWithoutWeightInPeriod,
  productionTotal,
  resolveCycleFcr,
  sumEggMassKgInPeriod,
} from "./cycle-operational-metrics";

function day(date: string) {
  return normalizeBusinessDate(new Date(`${date}T00:00:00.000Z`));
}

describe("egg-mass FCR", () => {
  test("computeFcr = feed kg / egg mass kg; null when egg mass <= 0", () => {
    expect(computeFcr(200, 60)).toBeCloseTo(3.3333, 3);
    expect(computeFcr(200, 0)).toBeNull();
    expect(computeFcr(0, 60)).toBeNull();
  });

  test("sumEggMassKgInPeriod sums (total x weight gram)/1000 within period", () => {
    const rows = [
      { record_date: day("2026-08-01"), tb: 1000, tr: 10, tp: 5, weight: 60 },
      { record_date: day("2026-08-02"), tb: 2000, tr: 0, tp: 0, weight: null },
      { record_date: day("2026-08-10"), tb: 500, tr: 0, tp: 0, weight: 50 },
    ];

    const eggMass = sumEggMassKgInPeriod(
      rows,
      day("2026-08-01"),
      day("2026-08-03"),
    );
    // (1015 × 60) / 1000 = 60.9; baris tanpa berat tidak dihitung
    expect(eggMass).toBeCloseTo(60.9, 3);
  });

  test("productionTotal sums all buckets", () => {
    expect(productionTotal({ tb: 1200, tr: 30, tp: 15 })).toBe(1245);
  });

  test("computeCrackRatio counts TR only (TP = Telur Putih, bukan cacat)", () => {
    expect(computeCrackRatio(900, 50, 50)).toBeCloseTo(0.05, 6);
    expect(computeCrackRatio(0, 0, 0)).toBeNull();
  });

  test("resolveCycleFcr is null when any production day lacks weight (UAT TC-05)", () => {
    const rows = [
      { record_date: day("2026-08-01"), tb: 2500, tr: 150, tp: 50, weight: 60 },
      { record_date: day("2026-08-02"), tb: 100, tr: 0, tp: 0, weight: null },
    ];
    const start = day("2026-08-01");
    const end = day("2026-08-02");
    expect(hasProductionWithoutWeightInPeriod(rows, start, end)).toBe(true);
    // feed day 1+2 = 648, egg mass only day 1 = 162 → partial FCR would be 4.0
    expect(resolveCycleFcr(648, rows, start, end)).toBeNull();
    expect(
      resolveCycleFcr(324, [rows[0]!], start, day("2026-08-01")),
    ).toBeCloseTo(2, 5);
  });
});
