import { redirect } from "next/navigation";
import {
  getServerSession,
  hasPermission,
  type ServerSession,
} from "@/features/auth/lib/session";

export async function requirePermission(
  permission: string,
  options?: { redirectTo?: string },
) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, permission)) {
    redirect(options?.redirectTo ?? "/dashboard");
  }

  return session;
}

/** Superadmin global accounts (`tenant_id` null). */
export function requireGlobalAdmin(session: ServerSession) {
  if (session.user.tenantId !== null) {
    redirect("/dashboard");
  }
  return session;
}
