import { headers } from "next/headers";
import { auth } from "@/features/auth/server/auth";

export async function getServerSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export type ServerSession = NonNullable<
  Awaited<ReturnType<typeof getServerSession>>
>;

/** Effective tenant scope: session override for superadmin, else user's branch. */
export function getActiveSubdomainId(session: ServerSession) {
  return session.session.activeSubdomainId ?? session.user.subdomainId ?? null;
}

export function hasPermission(session: ServerSession, permission: string) {
  return session.user.permissions?.includes(permission) ?? false;
}
