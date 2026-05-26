import { describe, expect, test } from "bun:test";
import { parseTenantListFilters } from "./parse-filters";

describe("parseTenantListFilters", () => {
  test("defaults status to all", () => {
    expect(parseTenantListFilters({})).toEqual({
      search: undefined,
      status: "all",
    });
  });

  test("accepts active and inactive status", () => {
    expect(parseTenantListFilters({ status: "active" }).status).toBe("active");
    expect(parseTenantListFilters({ status: "inactive" }).status).toBe(
      "inactive",
    );
  });

  test("ignores invalid status", () => {
    expect(parseTenantListFilters({ status: "bogus" }).status).toBe("all");
  });

  test("passes search query", () => {
    expect(parseTenantListFilters({ q: "utama" }).search).toBe("utama");
  });
});
