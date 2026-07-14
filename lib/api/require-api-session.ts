import {
  getActiveTenantId,
  getServerSession,
  hasPermission,
  type ServerSession,
} from "@/features/auth/lib/session";
import { apiError } from "@/lib/api/response";

type ApiSessionResult =
  | { session: ServerSession; error: null }
  | { session: null; error: Response };

export async function requireApiSession(): Promise<ApiSessionResult> {
  const session = await getServerSession();

  if (!session) {
    return {
      session: null,
      error: apiError("Unauthorized", 401),
    };
  }

  return { session, error: null };
}

export async function requireApiPermission(
  permission: string,
): Promise<ApiSessionResult> {
  const result = await requireApiSession();

  if (!result.session) {
    return result;
  }

  if (!hasPermission(result.session, permission)) {
    return {
      session: null,
      error: apiError("Forbidden", 403),
    };
  }

  return result;
}

type ApiTenantScopeResult =
  | { session: ServerSession; tenantId: string; error: null }
  | { session: null; tenantId: null; error: Response };

export function resolveApiTenantScope(
  session: ServerSession,
): Pick<ApiTenantScopeResult, "tenantId" | "error"> {
  const tenantId = getActiveTenantId(session);

  if (!tenantId) {
    return {
      tenantId: null,
      error: apiError(
        "Tenant aktif belum dipilih. Pilih cabang terlebih dahulu.",
        403,
      ),
    };
  }

  return { tenantId, error: null };
}

export async function requireApiPermissionWithTenant(
  permission: string,
): Promise<ApiTenantScopeResult> {
  const auth = await requireApiPermission(permission);

  if (!auth.session) {
    return { session: null, tenantId: null, error: auth.error };
  }

  const scope = resolveApiTenantScope(auth.session);

  if (scope.error || !scope.tenantId) {
    return {
      session: null,
      tenantId: null,
      error: scope.error ?? apiError("Tenant aktif tidak valid.", 403),
    };
  }

  return {
    session: auth.session,
    tenantId: scope.tenantId,
    error: null,
  };
}
