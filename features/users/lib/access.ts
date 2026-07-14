import { requirePermission } from "@/features/auth/lib/require-permission";
import {
  getActiveTenantId,
  type ServerSession,
} from "@/features/auth/lib/session";

export async function requireManageUsersSession() {
  return requirePermission("manage_users");
}

export function getUsersTenantScope(session: ServerSession) {
  const isGlobalAdmin = session.user.tenantId === null;
  const scopedTenantId = isGlobalAdmin
    ? null
    : getActiveTenantId(session);

  if (!isGlobalAdmin && !scopedTenantId) {
    throw new Error("Tenant aktif tidak ditemukan untuk akun ini.");
  }

  return { isGlobalAdmin, scopedTenantId };
}
