import { requirePermission } from "@/features/auth/lib/require-permission";
import {
  getActiveSubdomainId,
  type ServerSession,
} from "@/features/auth/lib/session";

export async function requireManageUsersSession() {
  return requirePermission("manage_users");
}

export function getUsersTenantScope(session: ServerSession) {
  const isGlobalAdmin = session.user.subdomainId === null;
  const scopedSubdomainId = isGlobalAdmin
    ? null
    : getActiveSubdomainId(session);

  if (!isGlobalAdmin && !scopedSubdomainId) {
    throw new Error("Cabang aktif tidak ditemukan untuk akun ini.");
  }

  return { isGlobalAdmin, scopedSubdomainId };
}
