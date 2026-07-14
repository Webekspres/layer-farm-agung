import { describe, expect, test } from "bun:test";
import {
  formatBusinessDate,
  parseBusinessDateParam,
  startOfTodayBusiness,
} from "@/features/production/lib/parse-production-date";

describe("parse-production-date re-exports", () => {
  test("keeps backward-compatible import path", () => {
    const now = new Date("2026-06-11T15:30:00.000Z");
    const date = parseBusinessDateParam(null, now);
    expect(formatBusinessDate(date)).toBe("2026-06-11");
    expect(startOfTodayBusiness(now).toISOString()).toBe(
      "2026-06-11T00:00:00.000Z",
    );
  });
});
