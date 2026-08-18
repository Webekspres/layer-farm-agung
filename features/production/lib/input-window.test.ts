import { describe, expect, test } from "bun:test";

import {
  DEFAULT_ADMIN_LOOKBACK_DAYS,
  DEFAULT_STAFF_LOOKBACK_DAYS,
  validateDateInCycle,
  validateDateInLookbackWindow,
} from "./input-window";
import {
  normalizeBusinessDate,
  shiftBusinessDate,
  startOfTodayBusiness,
} from "@/lib/business-date";

describe("validateDateInLookbackWindow", () => {
  const today = startOfTodayBusiness(new Date("2026-08-18T09:00:00.000Z"));
  const window = {
    minDate: shiftBusinessDate(today, -DEFAULT_STAFF_LOOKBACK_DAYS),
    maxDate: today,
    lookbackDays: DEFAULT_STAFF_LOOKBACK_DAYS,
  };

  test("accepts today", () => {
    const result = validateDateInLookbackWindow(today, window);
    expect(result.ok).toBe(true);
  });

  test("accepts date within lookback window", () => {
    const within = shiftBusinessDate(today, -DEFAULT_STAFF_LOOKBACK_DAYS);
    const result = validateDateInLookbackWindow(within, window);
    expect(result.ok).toBe(true);
  });

  test("rejects date older than lookback window", () => {
    const tooOld = shiftBusinessDate(today, -(DEFAULT_STAFF_LOOKBACK_DAYS + 1));
    const result = validateDateInLookbackWindow(tooOld, window);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("di luar batas input");
    }
  });

  test("rejects future date", () => {
    const future = shiftBusinessDate(today, 1);
    const result = validateDateInLookbackWindow(future, window);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("masa depan");
    }
  });

  test("admin default is 30 days", () => {
    expect(DEFAULT_ADMIN_LOOKBACK_DAYS).toBe(30);
  });
});

describe("validateDateInCycle", () => {
  const start = normalizeBusinessDate(new Date("2026-01-01T00:00:00.000Z"));
  const cycle = { start_date: start, end_date: null };

  test("accepts date on or after start_date", () => {
    const result = validateDateInCycle(
      normalizeBusinessDate(new Date("2026-01-01T00:00:00.000Z")),
      cycle,
    );
    expect(result.ok).toBe(true);
  });

  test("rejects date before start_date", () => {
    const result = validateDateInCycle(
      normalizeBusinessDate(new Date("2025-12-31T00:00:00.000Z")),
      cycle,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("sebelum dimulainya siklus");
    }
  });

  test("rejects date after end_date when set", () => {
    const bounded = { start_date: start, end_date: new Date("2026-12-31") };
    const result = validateDateInCycle(
      normalizeBusinessDate(new Date("2027-01-01T00:00:00.000Z")),
      bounded,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("setelah selesainya siklus");
    }
  });

  test("accepts any date when cycle is null", () => {
    const result = validateDateInCycle(
      normalizeBusinessDate(new Date("2025-01-01T00:00:00.000Z")),
      null,
    );
    expect(result.ok).toBe(true);
  });
});
