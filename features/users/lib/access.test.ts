import { describe, expect, test } from "bun:test";
import type { ServerSession } from "@/features/auth/lib/session";
import { getUsersTenantScope } from "@/features/users/lib/access";

function sessionFixture(
  partial: Partial<{
    tenantId: string | null;
    activeTenantId: string | null;
  }> = {},
): ServerSession {
  return {
    user: {
      tenantId:
        partial.tenantId !== undefined ? partial.tenantId : null,
    },
    session: {
      activeTenantId: partial.activeTenantId ?? null,
    },
  } as ServerSession;
}

describe("getUsersTenantScope", () => {
  test("global admin has null scoped tenant (all tenants)", () => {
    const result = getUsersTenantScope(
      sessionFixture({ tenantId: null, activeTenantId: "any-branch" }),
    );
    expect(result.isGlobalAdmin).toBe(true);
    expect(result.scopedTenantId).toBeNull();
  });

  test("branch admin is scoped to active tenant", () => {
    const branchId = "550e8400-e29b-41d4-a716-446655440000";
    const result = getUsersTenantScope(
      sessionFixture({
        tenantId: branchId,
        activeTenantId: branchId,
      }),
    );
    expect(result.isGlobalAdmin).toBe(false);
    expect(result.scopedTenantId).toBe(branchId);
  });

  test("branch admin uses session override when superadmin switched branch", () => {
    const homeBranch = "550e8400-e29b-41d4-a716-446655440001";
    const activeBranch = "550e8400-e29b-41d4-a716-446655440002";
    const result = getUsersTenantScope(
      sessionFixture({
        tenantId: homeBranch,
        activeTenantId: activeBranch,
      }),
    );
    expect(result.isGlobalAdmin).toBe(false);
    expect(result.scopedTenantId).toBe(activeBranch);
  });

  test("throws when non-global user has no resolvable tenant", () => {
    const session = {
      user: { tenantId: undefined },
      session: { activeTenantId: null },
    } as unknown as ServerSession;
    expect(() => getUsersTenantScope(session)).toThrow(
      "Tenant aktif tidak ditemukan untuk akun ini.",
    );
  });
});
