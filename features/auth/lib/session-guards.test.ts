import { describe, expect, test } from "bun:test";
import { APIError } from "better-auth/api";
import {
  assertActiveTenantContext,
  assertUserMayUseSession,
} from "@/features/auth/lib/session-guards";

describe("assertUserMayUseSession", () => {
  test("allows active global user", () => {
    expect(() =>
      assertUserMayUseSession({
        is_active: true,
        tenant_id: null,
        tenant: null,
      }),
    ).not.toThrow();
  });

  test("rejects inactive user", () => {
    expect(() =>
      assertUserMayUseSession({
        is_active: false,
        tenant_id: null,
        tenant: null,
      }),
    ).toThrow(APIError);
  });

  test("rejects user on inactive home branch", () => {
    expect(() =>
      assertUserMayUseSession({
        is_active: true,
        tenant_id: "branch-1",
        tenant: { is_active: false },
      }),
    ).toThrow(APIError);
  });
});

describe("assertActiveTenantContext", () => {
  test("allows active branch context", () => {
    expect(() => assertActiveTenantContext({ is_active: true })).not.toThrow();
  });

  test("rejects inactive branch context", () => {
    expect(() => assertActiveTenantContext({ is_active: false })).toThrow(
      APIError,
    );
  });

  test("rejects missing tenant context", () => {
    expect(() => assertActiveTenantContext(null)).toThrow(APIError);
  });
});
