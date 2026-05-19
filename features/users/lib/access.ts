import { redirect } from "next/navigation";
import {
  getActiveSubdomainId,
  getServerSession,
  hasPermission,
  type ServerSession,
} from "@/features/auth/lib/session";

export async function requireManageUsersSession() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "manage_users")) {
    redirect("/dashboard");
  }

  return session;
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
