import prisma from "@/lib/prisma";
import { filterAssignableRoles } from "@/features/users/lib/role-tenant";
import type { UserFormOptions } from "@/features/users/types";

export async function getUserFormOptions(
  isGlobalAdmin: boolean,
  scopedTenantId: string | null,
): Promise<UserFormOptions> {
  const [allRoles, tenants] = await Promise.all([
    prisma.role.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    isGlobalAdmin
      ? prisma.tenant.findMany({
          where: { is_active: true },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
  ]);

  return {
    roles: filterAssignableRoles(allRoles, isGlobalAdmin),
    tenants,
    isGlobalAdmin,
    defaultTenantId: scopedTenantId,
  };
}
