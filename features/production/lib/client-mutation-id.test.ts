import { describe, expect, test } from "bun:test";
import {
  isPrismaUniqueViolation,
  optionalClientMutationIdSchema,
  optionalFromSyncSchema,
} from "@/features/production/lib/client-mutation-id";

const uuid = "3fa85f64-5717-4562-b3fc-2c963f66afa6";

describe("client-mutation-id", () => {
  test("optionalClientMutationIdSchema accepts valid uuid", () => {
    expect(optionalClientMutationIdSchema.parse(uuid)).toBe(uuid);
  });

  test("optionalClientMutationIdSchema treats empty as undefined", () => {
    expect(optionalClientMutationIdSchema.parse("")).toBeUndefined();
  });

  test("optionalFromSyncSchema defaults false", () => {
    expect(optionalFromSyncSchema.parse(undefined)).toBe(false);
    expect(optionalFromSyncSchema.parse(true)).toBe(true);
  });

  test("isPrismaUniqueViolation detects P2002", () => {
    expect(isPrismaUniqueViolation({ code: "P2002" })).toBe(true);
    expect(isPrismaUniqueViolation({ code: "P2025" })).toBe(false);
    expect(isPrismaUniqueViolation(new Error("x"))).toBe(false);
  });
});
