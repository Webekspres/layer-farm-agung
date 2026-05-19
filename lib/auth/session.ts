import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function getServerSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

/** Effective tenant scope: session override for superadmin, else user's branch. */
export function getActiveSubdomainId(
  session: NonNullable<Awaited<ReturnType<typeof getServerSession>>>,
) {
  return session.session.activeSubdomainId ?? session.user.subdomainId ?? null;
}

export function hasPermission(
  session: NonNullable<Awaited<ReturnType<typeof getServerSession>>>,
  permission: string,
) {
  return session.user.permissions?.includes(permission) ?? false;
}
