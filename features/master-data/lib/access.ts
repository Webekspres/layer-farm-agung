import {
  requireGlobalAdmin,
  requirePermission,
} from "@/features/auth/lib/require-permission";
import {
  getActiveTenantId,
  type ServerSession,
} from "@/features/auth/lib/session";

/** Tenant-scoped master data: lokasi, kandang, vendor. */
export async function requireManageMasterDataSession() {
  return requirePermission("manage_master_data");
}

/** Global catalog (strain, grade telur): superadmin / AAPM only. */
export async function requireManageGlobalCatalogSession() {
  const session = await requirePermission("manage_global_catalog");
  requireGlobalAdmin(session);
  return session;
}

/** Tenant scope for location, cage, vendor, and other tenant-bound master data. */
export function getMasterDataTenantScope(session: ServerSession) {
  const tenantId = getActiveTenantId(session);

  return {
    tenantId,
    needsTenantSelection: tenantId === null,
  };
}
