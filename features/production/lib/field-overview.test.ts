import { describe, expect, test } from "bun:test";
import {
  buildFieldOverview,
  emptyFieldOverview,
} from "@/features/production/lib/field-overview";
import { normalizeBusinessDate } from "@/lib/business-date";

const TODAY = normalizeBusinessDate(new Date("2026-08-03T00:00:00.000Z"));

describe("buildFieldOverview", () => {
  test("returns empty series when no cages assigned", () => {
    const result = buildFieldOverview({
      recordDate: TODAY,
      cages: [],
      todayTb: 0,
      todayTr: 0,
      todayTp: 0,
      pendingVaccineCount: 0,
      overdueVaccineCount: 0,
      tbByDate: new Map(),
    });

    expect(result).toEqual(emptyFieldOverview(TODAY));
    expect(result.cagesActive).toBe(0);
    expect(result.todayHdp).toBeNull();
    expect(result.production7d).toHaveLength(7);
    expect(result.hdp7d.every((p) => p.hdp === null)).toBe(true);
  });

  test("HDP is null when population is zero", () => {
    const result = buildFieldOverview({
      recordDate: TODAY,
      cages: [
        {
          id: "c1",
          name: "A1",
          population: 0,
          recordedToday: true,
          targetHdp: 90,
        },
      ],
      todayTb: 100,
      todayTr: 0,
      todayTp: 0,
      pendingVaccineCount: 0,
      overdueVaccineCount: 0,
      tbByDate: new Map([["2026-08-03", 100]]),
    });

    expect(result.todayHdp).toBeNull();
    expect(result.populationTotal).toBe(0);
    expect(result.hdp7d.every((p) => p.hdp === null)).toBe(true);
    expect(result.targetHdpAvg).toBe(90);
  });

  test("aggregates KPIs and incomplete cages for assigned cages only", () => {
    const result = buildFieldOverview({
      recordDate: TODAY,
      cages: [
        {
          id: "c1",
          name: "A1",
          population: 1000,
          recordedToday: true,
          targetHdp: 92,
        },
        {
          id: "c2",
          name: "B2",
          population: 1000,
          recordedToday: false,
          targetHdp: 88,
        },
      ],
      todayTb: 1800,
      todayTr: 10,
      todayTp: 5,
      pendingVaccineCount: 3,
      overdueVaccineCount: 1,
      tbByDate: new Map([
        ["2026-08-02", 1700],
        ["2026-08-03", 1800],
      ]),
    });

    expect(result.cagesActive).toBe(2);
    expect(result.populationTotal).toBe(2000);
    expect(result.recordedTodayCount).toBe(1);
    expect(result.todayTb).toBe(1800);
    expect(result.todayTr).toBe(10);
    expect(result.todayTp).toBe(5);
    expect(result.todayHdp).toBe(90);
    expect(result.targetHdpAvg).toBe(90);
    expect(result.pendingVaccineCount).toBe(3);
    expect(result.overdueVaccineCount).toBe(1);
    expect(result.incompleteCages).toEqual([{ id: "c2", name: "B2" }]);

    const todayPoint = result.production7d.find((p) => p.date === "2026-08-03");
    expect(todayPoint?.eggs).toBe(1800);

    const todayHdp = result.hdp7d.find((p) => p.date === "2026-08-03");
    expect(todayHdp?.hdp).toBe(90);
    expect(todayHdp?.target).toBe(90);
  });

  test("fills missing production days with zero eggs", () => {
    const result = buildFieldOverview({
      recordDate: TODAY,
      cages: [
        {
          id: "c1",
          name: "A1",
          population: 500,
          recordedToday: false,
          targetHdp: null,
        },
      ],
      todayTb: 0,
      todayTr: 0,
      todayTp: 0,
      pendingVaccineCount: 0,
      overdueVaccineCount: 0,
      tbByDate: new Map([["2026-08-01", 400]]),
    });

    expect(result.production7d).toHaveLength(7);
    expect(result.production7d[0]?.eggs).toBe(0);
    expect(result.production7d.find((p) => p.date === "2026-08-01")?.eggs).toBe(
      400,
    );
    expect(result.targetHdpAvg).toBeNull();
  });
});
