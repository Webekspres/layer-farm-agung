import { describe, expect, test } from "bun:test";
import { parseSubdomainListFilters } from "./parse-filters";

describe("parseSubdomainListFilters", () => {
  test("defaults status to all", () => {
    expect(parseSubdomainListFilters({})).toEqual({
      search: undefined,
      status: "all",
    });
  });

  test("accepts active and inactive status", () => {
    expect(parseSubdomainListFilters({ status: "active" }).status).toBe("active");
    expect(parseSubdomainListFilters({ status: "inactive" }).status).toBe(
      "inactive",
    );
  });

  test("ignores invalid status", () => {
    expect(parseSubdomainListFilters({ status: "bogus" }).status).toBe("all");
  });

  test("passes search query", () => {
    expect(parseSubdomainListFilters({ q: "utama" }).search).toBe("utama");
  });
});
