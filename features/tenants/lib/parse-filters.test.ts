import { describe, expect, test } from "bun:test";
import { parseTenantListFilters } from "./parse-filters";

describe("parseTenantListFilters", () => {
  test("defaults status to active", () => {
    expect(parseTenantListFilters({})).toEqual({
      search: undefined,
      status: "active",
    });
  });

  test("accepts active, inactive, and all status", () => {
    expect(parseTenantListFilters({ status: "active" }).status).toBe("active");
    expect(parseTenantListFilters({ status: "inactive" }).status).toBe(
      "inactive",
    );
    expect(parseTenantListFilters({ status: "all" }).status).toBe("all");
  });

  test("ignores invalid status", () => {
    expect(parseTenantListFilters({ status: "bogus" }).status).toBe("active");
  });

  test("passes search query", () => {
    expect(parseTenantListFilters({ q: "utama" }).search).toBe("utama");
  });
});
