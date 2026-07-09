import { describe, expect, test } from "bun:test";
import {
  businessDateSchema,
  calendarPickToBusinessDate,
  businessDateToCalendarPick,
  formatBusinessDate,
  formatBusinessDateFromDb,
  isAfterTodayBusiness,
  normalizeBusinessDate,
  operationalBusinessDateSchema,
  parseBusinessDateParam,
  shiftBusinessDate,
  startOfTodayBusiness,
  validateOperationalBusinessDate,
} from "@/lib/business-date";

describe("business-date", () => {
  const now = new Date("2026-06-11T15:30:00.000Z");

  test("defaults to WIB today when param missing", () => {
    const date = parseBusinessDateParam(null, now);
    expect(formatBusinessDate(date)).toBe("2026-06-11");
  });

  test("uses WIB calendar when UTC date is still previous day", () => {
    const jakartaMorning = new Date("2026-06-10T20:00:00.000Z");
    const date = parseBusinessDateParam(null, jakartaMorning);
    expect(formatBusinessDate(date)).toBe("2026-06-11");
  });

  test("parses valid YYYY-MM-DD as UTC midnight", () => {
    const date = parseBusinessDateParam("2026-05-19", now);
    expect(date.toISOString()).toBe("2026-05-19T00:00:00.000Z");
  });

  test("rejects invalid calendar date in param", () => {
    const date = parseBusinessDateParam("2026-02-30", now);
    expect(formatBusinessDate(date)).toBe("2026-06-11");
  });

  test("shiftBusinessDate moves by days", () => {
    const base = normalizeBusinessDate(new Date("2026-06-11T00:00:00.000Z"));
    expect(formatBusinessDate(shiftBusinessDate(base, -1))).toBe("2026-06-10");
  });

  test("calendarPickToBusinessDate keeps picked local day", () => {
    const picked = new Date(2026, 6, 9);
    const recordDate = calendarPickToBusinessDate(picked);

    expect(formatBusinessDate(recordDate)).toBe("2026-07-09");
    expect(businessDateToCalendarPick(recordDate).getDate()).toBe(9);
  });

  test("formatBusinessDateFromDb normalizes Prisma date values", () => {
    expect(formatBusinessDateFromDb(new Date("2026-07-09T00:00:00.000Z"))).toBe(
      "2026-07-09",
    );
  });

  test("businessDateSchema accepts ISO date strings only", () => {
    const ok = businessDateSchema.safeParse("2026-05-19");
    expect(ok.success).toBe(true);

    const bad = businessDateSchema.safeParse("19/05/2026");
    expect(bad.success).toBe(false);
  });

  test("operationalBusinessDateSchema rejects future WIB dates", () => {
    const future = operationalBusinessDateSchema.safeParse("2099-01-01");
    expect(future.success).toBe(false);
  });

  test("validateOperationalBusinessDate blocks future dates", () => {
    const future = normalizeBusinessDate(new Date("2099-01-01T00:00:00.000Z"));
    expect(validateOperationalBusinessDate(future, now)).toEqual({
      ok: false,
      error: "Tanggal tidak boleh di masa depan.",
    });
  });

  test("isAfterTodayBusiness uses WIB not UTC clock", () => {
    const jakartaMorning = new Date("2026-06-10T20:00:00.000Z");
    expect(isAfterTodayBusiness(startOfTodayBusiness(jakartaMorning), jakartaMorning)).toBe(
      false,
    );
  });
});
