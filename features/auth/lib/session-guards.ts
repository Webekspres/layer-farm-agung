import { APIError } from "better-auth/api";

export type SessionGuardUser = {
  is_active: boolean;
  tenant_id: string | null;
  tenant: { is_active: boolean } | null;
};

/**
 * Validates user + home tenant on every session read (not only at login).
 */
export function assertUserMayUseSession(user: SessionGuardUser) {
  if (!user.is_active) {
    throw new APIError("UNAUTHORIZED", {
      message: "Akun tidak aktif. Hubungi administrator.",
    });
  }

  if (user.tenant_id && user.tenant && !user.tenant.is_active) {
    throw new APIError("UNAUTHORIZED", {
      message: "Tenant peternakan tidak aktif.",
    });
  }
}

/**
 * Superadmin context switch: active_tenant_id must point to an active tenant.
 */
export function assertActiveTenantContext(tenant: { is_active: boolean } | null) {
  if (!tenant) {
    throw new APIError("UNAUTHORIZED", {
      message: "Tenant konteks tidak ditemukan. Pilih tenant aktif kembali.",
    });
  }

  if (!tenant.is_active) {
    throw new APIError("UNAUTHORIZED", {
      message: "Tenant peternakan tidak aktif.",
    });
  }
}
