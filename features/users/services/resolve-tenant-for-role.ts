import prisma from "@/lib/prisma";
import { SUPERADMIN_ROLE_NAME } from "@/features/users/lib/role-tenant";

export async function resolveTenantForRoleAssignment(params: {
  roleId: number;
  tenantIdFromForm?: string;
  isGlobalAdmin: boolean;
  scopedTenantId: string | null;
}): Promise<{ tenantId: string | null; error?: string }> {
  const role = await prisma.role.findUnique({
    where: { id: params.roleId },
    select: { name: true },
  });

  if (!role) {
    return { tenantId: null, error: "Peran tidak ditemukan." };
  }

  if (role.name === SUPERADMIN_ROLE_NAME) {
    if (!params.isGlobalAdmin) {
      return {
        tenantId: null,
        error: "Hanya superadmin yang dapat membuat atau mengubah akun superadmin.",
      };
    }
    return { tenantId: null };
  }

  if (!params.isGlobalAdmin) {
    if (!params.scopedTenantId) {
      return { tenantId: null, error: "Tenant aktif tidak valid." };
    }
    return { tenantId: params.scopedTenantId };
  }

  const tenantId = params.tenantIdFromForm?.trim();
  if (!tenantId || tenantId === "global") {
    return {
      tenantId: null,
      error: "Pilih tenant untuk peran ini (bukan Global).",
    };
  }

  const tenant = await prisma.tenant.findFirst({
    where: { id: tenantId, is_active: true },
    select: { id: true },
  });

  if (!tenant) {
    return { tenantId: null, error: "Tenant tidak ditemukan atau nonaktif." };
  }

  return { tenantId: tenant.id };
}
