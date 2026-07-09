import { describe, expect, test } from "bun:test";

import {
  computeCyclePopulation,
  isPopulationDecreaseType,
} from "@/features/cages/lib/compute-cycle-population";

describe("computeCyclePopulation", () => {
  const asOf = new Date("2026-07-09T12:00:00.000Z");

  test("returns initial when no mutations", () => {
    expect(computeCyclePopulation(5000, [], asOf)).toBe(5000);
  });

  test("applies Masuk and Mati", () => {
    const mutations = [
      {
        mutation_type: "Masuk",
        quantity: 100,
        record_date: new Date("2026-07-08"),
      },
      {
        mutation_type: "Mati",
        quantity: 15,
        record_date: new Date("2026-07-09"),
      },
    ];
    expect(computeCyclePopulation(5000, mutations, asOf)).toBe(5085);
  });

  test("ignores mutations after asOfDate", () => {
    const mutations = [
      {
        mutation_type: "Mati",
        quantity: 50,
        record_date: new Date("2026-07-10"),
      },
    ];
    expect(computeCyclePopulation(5000, mutations, asOf)).toBe(5000);
  });

  test("floors at zero", () => {
    const mutations = [
      {
        mutation_type: "Afkir",
        quantity: 6000,
        record_date: new Date("2026-07-09"),
      },
    ];
    expect(computeCyclePopulation(5000, mutations, asOf)).toBe(0);
  });
});

describe("isPopulationDecreaseType", () => {
  test("identifies decrease types", () => {
    expect(isPopulationDecreaseType("Mati")).toBe(true);
    expect(isPopulationDecreaseType("Masuk")).toBe(false);
  });
});
