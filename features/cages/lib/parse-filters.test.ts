import { describe, expect, test } from "bun:test";
import { parseCageListFilters } from "@/features/cages/lib/parse-filters";

describe("parseCageListFilters", () => {
  test("parses location, strain, and status", () => {
    expect(
      parseCageListFilters({
        q: "a1",
        location: "loc-1",
        strain: "3",
        status: "Active",
      }),
    ).toEqual({
      search: "a1",
      locationId: "loc-1",
      strainId: 3,
      status: "Active",
    });
  });

  test("defaults status to Active if not provided", () => {
    expect(
      parseCageListFilters({
        location: "all",
        strain: "all",
      }),
    ).toEqual({
      search: undefined,
      locationId: undefined,
      strainId: undefined,
      status: "Active",
    });
  });

  test("treats all as no filter", () => {
    expect(
      parseCageListFilters({
        location: "all",
        strain: "all",
        status: "all",
      }),
    ).toEqual({
      search: undefined,
      locationId: undefined,
      strainId: undefined,
      status: undefined,
    });
  });
});
