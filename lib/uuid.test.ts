import { describe, expect, test } from "bun:test";

import { isUuid } from "@/lib/uuid";

describe("isUuid", () => {
  test("accepts valid uuid", () => {
    expect(isUuid("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
  });

  test("rejects mock slug ids", () => {
    expect(isUuid("cage-a1")).toBe(false);
  });
});
