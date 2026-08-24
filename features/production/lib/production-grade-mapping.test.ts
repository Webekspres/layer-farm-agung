import { describe, expect, test } from "bun:test";
import {
  computeEggMassKg,
  resolveProductionBuckets,
} from "./production-grade-mapping";

const grades = [
  { id: 1, code: "TB", is_active: true },
  { id: 2, code: "TR", is_active: true },
  { id: 3, code: "TP", is_active: true },
  { id: 4, code: null, is_active: true },
  { id: 5, code: "TR", is_active: false },
];

describe("resolveProductionBuckets", () => {
  test("maps TB/TR/TP entries into legacy buckets and totals all grades", () => {
    const res = resolveProductionBuckets(
      [
        { eggGradeId: 1, quantity: 1200 },
        { eggGradeId: 2, quantity: 30 },
        { eggGradeId: 3, quantity: 15 },
        { eggGradeId: 4, quantity: 5 },
      ],
      grades,
    );

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.buckets.tb).toBe(1200);
      expect(res.buckets.tr).toBe(30);
      expect(res.buckets.tp).toBe(15);
      expect(res.buckets.total).toBe(1250);
    }
  });

  test("rejects inactive grade", () => {
    const res = resolveProductionBuckets([{ eggGradeId: 5, quantity: 10 }], grades);
    expect(res.ok).toBe(false);
  });

  test("rejects unknown grade id", () => {
    const res = resolveProductionBuckets(
      [{ eggGradeId: 999, quantity: 10 }],
      grades,
    );
    expect(res.ok).toBe(false);
  });
});

describe("computeEggMassKg", () => {
  test("total eggs x avg weight (gram) / 1000", () => {
    expect(computeEggMassKg(1000, 60)).toBe(60);
    expect(computeEggMassKg(0, 60)).toBe(0);
    expect(computeEggMassKg(1815, 62.5)).toBeCloseTo(113.4375, 3);
  });
});
