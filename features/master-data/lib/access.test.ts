import { describe, expect, test } from "bun:test";
import { getMasterDataTenantScope } from "@/features/master-data/lib/access";
import type { ServerSession } from "@/features/auth/lib/session";

function sessionFixture(
  overrides: Partial<{
    tenantId: string | null;
    activeTenantId: string | null;
  }> = {},
): ServerSession {
  const tenantId =
    overrides.tenantId !== undefined ? overrides.tenantId : "tenant-a";
  const activeTenantId =
    overrides.activeTenantId !== undefined ? overrides.activeTenantId : null;

  return {
    session: { activeTenantId },
    user: { tenantId },
  } as ServerSession;
}

describe("getMasterDataTenantScope", () => {
  test("branch admin resolves tenant from user", () => {
    const scope = getMasterDataTenantScope(
      sessionFixture({ tenantId: "tenant-a", activeTenantId: null }),
    );
    expect(scope.tenantId).toBe("tenant-a");
    expect(scope.needsTenantSelection).toBe(false);
  });

  test("superadmin uses active tenant override", () => {
    const scope = getMasterDataTenantScope(
      sessionFixture({ tenantId: null, activeTenantId: "tenant-b" }),
    );
    expect(scope.tenantId).toBe("tenant-b");
    expect(scope.needsTenantSelection).toBe(false);
  });

  test("superadmin without active tenant needs selection", () => {
    const scope = getMasterDataTenantScope(
      sessionFixture({ tenantId: null, activeTenantId: null }),
    );
    expect(scope.tenantId).toBeNull();
    expect(scope.needsTenantSelection).toBe(true);
  });
});
