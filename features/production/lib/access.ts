import { requirePermission } from "@/features/auth/lib/require-permission";
import {
  getActiveTenantId,
  type ServerSession,
} from "@/features/auth/lib/session";

export async function requireManageProductionSession() {
  return requirePermission("manage_production");
}

export function getProductionTenantScope(session: ServerSession) {
  const tenantId = getActiveTenantId(session);

  return {
    tenantId,
    needsTenantSelection: tenantId === null,
  };
}
