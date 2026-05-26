import { describe, expect, test } from "bun:test";
import { parseLocationListFilters } from "@/features/locations/lib/parse-filters";

describe("parseLocationListFilters", () => {
  test("passes search query", () => {
    expect(parseLocationListFilters({ q: "utara" })).toEqual({
      search: "utara",
      occupancy: undefined,
    });
  });

  test("accepts occupancy filter", () => {
    expect(parseLocationListFilters({ occupancy: "empty" })).toEqual({
      search: undefined,
      occupancy: "empty",
    });
  });

  test("ignores invalid occupancy", () => {
    expect(parseLocationListFilters({ occupancy: "invalid" }).occupancy).toBe(
      undefined,
    );
  });
});
