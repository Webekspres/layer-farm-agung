import { describe, expect, test } from "bun:test";
import {
  formatProductionDateParam,
  isProductionToday,
  parseProductionRecordDate,
  shiftProductionDate,
  startOfUtcDate,
} from "@/features/production/lib/parse-production-date";

describe("parseProductionRecordDate", () => {
  const now = new Date("2026-06-11T15:30:00.000Z");

  test("defaults to today when param missing", () => {
    const date = parseProductionRecordDate(null, now);
    expect(formatProductionDateParam(date)).toBe("2026-06-11");
  });

  test("parses valid YYYY-MM-DD as UTC midnight", () => {
    const date = parseProductionRecordDate("2026-05-19", now);
    expect(date.toISOString()).toBe("2026-05-19T00:00:00.000Z");
  });

  test("rejects invalid calendar date", () => {
    const date = parseProductionRecordDate("2026-02-30", now);
    expect(formatProductionDateParam(date)).toBe("2026-06-11");
  });

  test("shiftProductionDate moves by days", () => {
    const base = startOfUtcDate(new Date("2026-06-11T00:00:00.000Z"));
    expect(formatProductionDateParam(shiftProductionDate(base, -1))).toBe(
      "2026-06-10",
    );
  });

  test("isProductionToday compares UTC dates", () => {
    const date = startOfUtcDate(new Date("2026-06-11T00:00:00.000Z"));
    expect(isProductionToday(date, now)).toBe(true);
    expect(
      isProductionToday(startOfUtcDate(new Date("2026-06-10T00:00:00.000Z")), now),
    ).toBe(false);
  });
});
