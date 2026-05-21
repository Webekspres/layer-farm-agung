import { describe, expect, test } from "bun:test";
import { APIError } from "better-auth/api";
import {
  assertActiveBranchContext,
  assertUserMayUseSession,
} from "@/features/auth/lib/session-guards";

describe("assertUserMayUseSession", () => {
  test("allows active global user", () => {
    expect(() =>
      assertUserMayUseSession({
        is_active: true,
        subdomain_id: null,
        subdomain: null,
      }),
    ).not.toThrow();
  });

  test("rejects inactive user", () => {
    expect(() =>
      assertUserMayUseSession({
        is_active: false,
        subdomain_id: null,
        subdomain: null,
      }),
    ).toThrow(APIError);
  });

  test("rejects user on inactive home branch", () => {
    expect(() =>
      assertUserMayUseSession({
        is_active: true,
        subdomain_id: "branch-1",
        subdomain: { is_active: false },
      }),
    ).toThrow(APIError);
  });
});

describe("assertActiveBranchContext", () => {
  test("allows active branch context", () => {
    expect(() => assertActiveBranchContext({ is_active: true })).not.toThrow();
  });

  test("rejects inactive branch context", () => {
    expect(() => assertActiveBranchContext({ is_active: false })).toThrow(
      APIError,
    );
  });
});
