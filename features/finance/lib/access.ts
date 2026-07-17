import { requirePermission } from "@/features/auth/lib/require-permission";
import {
  getActiveTenantId,
  type ServerSession,
} from "@/features/auth/lib/session";

/** Tenant-scoped finance access (cashflow, sales, customers) — read & write. */
export async function requireViewCashflowSession() {
  return requirePermission("view_cashflow");
}

/** Active tenant scope for finance pages/actions. */
export function getFinanceTenantScope(session: ServerSession) {
  const tenantId = getActiveTenantId(session);

  return {
    tenantId,
    needsTenantSelection: tenantId === null,
  };
}
