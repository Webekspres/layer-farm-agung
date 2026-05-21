import { describe, expect, test } from "bun:test";
import {
  getActiveSubdomainId,
  hasPermission,
  type ServerSession,
} from "@/features/auth/lib/session";

function sessionFixture(
  partial: Partial<{
    permissions: string[];
    subdomainId: string | null;
    activeSubdomainId: string | null;
  }> = {},
): ServerSession {
  return {
    user: {
      permissions: partial.permissions ?? [],
      subdomainId:
        partial.subdomainId !== undefined ? partial.subdomainId : null,
    },
    session: {
      activeSubdomainId: partial.activeSubdomainId ?? null,
    },
  } as ServerSession;
}

describe("getActiveSubdomainId", () => {
  test("prefers session activeSubdomainId over user subdomain", () => {
    const session = sessionFixture({
      subdomainId: "branch-a",
      activeSubdomainId: "branch-b",
    });
    expect(getActiveSubdomainId(session)).toBe("branch-b");
  });

  test("falls back to user subdomain when session override is null", () => {
    const session = sessionFixture({
      subdomainId: "branch-a",
      activeSubdomainId: null,
    });
    expect(getActiveSubdomainId(session)).toBe("branch-a");
  });

  test("returns null for global user with no override", () => {
    const session = sessionFixture({
      subdomainId: null,
      activeSubdomainId: null,
    });
    expect(getActiveSubdomainId(session)).toBeNull();
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
