import { requirePermission } from "@/features/auth/lib/require-permission";
import {
  getActiveTenantId,
  type ServerSession,
} from "@/features/auth/lib/session";

/** Vaksinasi (Modul 13) reuses `manage_production` — same operational scope as input harian. */
export async function requireManageVaccinationSession() {
  return requirePermission("manage_production");
}

export function getVaccinationTenantScope(session: ServerSession) {
  const tenantId = getActiveTenantId(session);

  return {
    tenantId,
    needsTenantSelection: tenantId === null,
  };
}
