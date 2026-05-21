import { describe, expect, test } from "bun:test";
import type { ServerSession } from "@/features/auth/lib/session";
import { getUsersTenantScope } from "@/features/users/lib/access";

function sessionFixture(
  partial: Partial<{
    subdomainId: string | null;
    activeSubdomainId: string | null;
  }> = {},
): ServerSession {
  return {
    user: {
      subdomainId:
        partial.subdomainId !== undefined ? partial.subdomainId : null,
    },
    session: {
      activeSubdomainId: partial.activeSubdomainId ?? null,
    },
  } as ServerSession;
}

describe("getUsersTenantScope", () => {
  test("global admin has null scoped subdomain (all branches)", () => {
    const result = getUsersTenantScope(
      sessionFixture({ subdomainId: null, activeSubdomainId: "any-branch" }),
    );
    expect(result.isGlobalAdmin).toBe(true);
    expect(result.scopedSubdomainId).toBeNull();
  });

  test("branch admin is scoped to active subdomain", () => {
    const branchId = "550e8400-e29b-41d4-a716-446655440000";
    const result = getUsersTenantScope(
      sessionFixture({
        subdomainId: branchId,
        activeSubdomainId: branchId,
      }),
    );
    expect(result.isGlobalAdmin).toBe(false);
    expect(result.scopedSubdomainId).toBe(branchId);
  });

  test("branch admin uses session override when superadmin switched branch", () => {
    const homeBranch = "550e8400-e29b-41d4-a716-446655440001";
    const activeBranch = "550e8400-e29b-41d4-a716-446655440002";
    const result = getUsersTenantScope(
      sessionFixture({
        subdomainId: homeBranch,
        activeSubdomainId: activeBranch,
      }),
    );
    expect(result.isGlobalAdmin).toBe(false);
    expect(result.scopedSubdomainId).toBe(activeBranch);
  });

  test("throws when non-global user has no resolvable subdomain", () => {
    const session = {
      user: { subdomainId: undefined },
      session: { activeSubdomainId: null },
    } as ServerSession;
    expect(() => getUsersTenantScope(session)).toThrow(
      "Cabang aktif tidak ditemukan untuk akun ini.",
    );
  });
});
