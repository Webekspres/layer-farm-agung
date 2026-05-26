import { describe, expect, test } from "bun:test";
import {
  getActiveTenantId,
  hasPermission,
  type ServerSession,
} from "@/features/auth/lib/session";

function sessionFixture(
  partial: Partial<{
    permissions: string[];
    tenantId: string | null;
    activeTenantId: string | null;
  }> = {},
): ServerSession {
  return {
    user: {
      permissions: partial.permissions ?? [],
      tenantId:
        partial.tenantId !== undefined ? partial.tenantId : null,
    },
    session: {
      activeTenantId: partial.activeTenantId ?? null,
    },
  } as ServerSession;
}

describe("getActiveTenantId", () => {
  test("prefers session activeTenantId over user tenant", () => {
    const session = sessionFixture({
      tenantId: "branch-a",
      activeTenantId: "branch-b",
    });
    expect(getActiveTenantId(session)).toBe("branch-b");
  });

  test("falls back to user tenant when session override is null", () => {
    const session = sessionFixture({
      tenantId: "branch-a",
      activeTenantId: null,
    });
    expect(getActiveTenantId(session)).toBe("branch-a");
  });

  test("returns null for global user with no override", () => {
    const session = sessionFixture({
      tenantId: null,
      activeTenantId: null,
    });
    expect(getActiveTenantId(session)).toBeNull();
  });
});

describe("hasPermission", () => {
  test("returns true when permission is granted", () => {
    const session = sessionFixture({
      permissions: ["manage_users", "view_dashboard"],
    });
    expect(hasPermission(session, "manage_users")).toBe(true);
  });

  test("returns false when permission is missing", () => {
    const session = sessionFixture({ permissions: ["view_dashboard"] });
    expect(hasPermission(session, "manage_users")).toBe(false);
  });

  test("returns false when permissions list is undefined", () => {
    const session = { user: {}, session: {} } as ServerSession;
    expect(hasPermission(session, "manage_users")).toBe(false);
  });
});
