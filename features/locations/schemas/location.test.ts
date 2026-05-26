import { describe, expect, test } from "bun:test";
import { locationSchema } from "@/features/locations/schemas/location";

describe("locationSchema", () => {
  test("accepts valid name", () => {
    const result = locationSchema.safeParse({ name: "Kandang Utara" });
    expect(result.success).toBe(true);
  });

  test("rejects short name", () => {
    const result = locationSchema.safeParse({ name: "A" });
    expect(result.success).toBe(false);
  });
});
