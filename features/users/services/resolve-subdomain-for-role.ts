import prisma from "@/lib/prisma";
import { SUPERADMIN_ROLE_NAME } from "@/features/users/lib/role-subdomain";

export async function resolveSubdomainForRoleAssignment(params: {
  roleId: number;
  subdomainIdFromForm?: string;
  isGlobalAdmin: boolean;
  scopedSubdomainId: string | null;
}): Promise<{ subdomainId: string | null; error?: string }> {
  const role = await prisma.role.findUnique({
    where: { id: params.roleId },
    select: { name: true },
  });

  if (!role) {
    return { subdomainId: null, error: "Peran tidak ditemukan." };
  }

  if (role.name === SUPERADMIN_ROLE_NAME) {
    return { subdomainId: null };
  }

  if (!params.isGlobalAdmin) {
    if (!params.scopedSubdomainId) {
      return { subdomainId: null, error: "Cabang aktif tidak valid." };
    }
    return { subdomainId: params.scopedSubdomainId };
  }

  const branchId = params.subdomainIdFromForm?.trim();
  if (!branchId || branchId === "global") {
    return {
      subdomainId: null,
      error: "Pilih cabang untuk peran ini (bukan Global).",
    };
  }

  const branch = await prisma.subdomain.findFirst({
    where: { id: branchId, is_active: true },
    select: { id: true },
  });

  if (!branch) {
    return { subdomainId: null, error: "Cabang tidak ditemukan atau nonaktif." };
  }

  return { subdomainId: branch.id };
}
