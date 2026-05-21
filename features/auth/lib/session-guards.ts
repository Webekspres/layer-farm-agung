import { APIError } from "better-auth/api";

export type SessionGuardUser = {
  is_active: boolean;
  subdomain_id: string | null;
  subdomain: { is_active: boolean } | null;
};

/**
 * Validates user + home branch on every session read (not only at login).
 */
export function assertUserMayUseSession(user: SessionGuardUser) {
  if (!user.is_active) {
    throw new APIError("UNAUTHORIZED", {
      message: "Akun tidak aktif. Hubungi administrator.",
    });
  }

  if (user.subdomain_id && user.subdomain && !user.subdomain.is_active) {
    throw new APIError("UNAUTHORIZED", {
      message: "Cabang peternakan tidak aktif.",
    });
  }
}

/**
 * Superadmin context switch: active_subdomain_id must point to an active branch.
 */
export function assertActiveBranchContext(branch: { is_active: boolean } | null) {
  if (branch && !branch.is_active) {
    throw new APIError("UNAUTHORIZED", {
      message: "Cabang peternakan tidak aktif.",
    });
  }
}
