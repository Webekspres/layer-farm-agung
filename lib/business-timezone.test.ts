import { describe, expect, test } from "bun:test";
import {
  businessDateFromInstant,
  getBusinessCalendarParts,
} from "@/lib/business-timezone";

describe("business timezone (Asia/Jakarta)", () => {
  test("maps late UTC evening to next WIB calendar day", () => {
    const instant = new Date("2026-06-10T20:00:00.000Z");
    expect(getBusinessCalendarParts(instant)).toEqual({
      year: 2026,
      month: 6,
      day: 11,
    });
    expect(businessDateFromInstant(instant).toISOString()).toBe(
      "2026-06-11T00:00:00.000Z",
    );
  });
});
