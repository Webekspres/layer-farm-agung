import { requirePermission } from "@/features/auth/lib/require-permission";
import {
  getActiveTenantId,
  type ServerSession,
} from "@/features/auth/lib/session";

/** Tenant-scoped inventory management (item master, stock, adjustments). */
export async function requireManageInventorySession() {
  return requirePermission("manage_inventory");
}

/** Active tenant scope for inventory pages/actions. */
export function getInventoryTenantScope(session: ServerSession) {
  const tenantId = getActiveTenantId(session);

  return {
    tenantId,
    needsTenantSelection: tenantId === null,
  };
}
