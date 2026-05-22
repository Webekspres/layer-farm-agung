import prisma from "@/lib/prisma";
import { filterAssignableRoles } from "@/features/users/lib/role-subdomain";
import type { UserFormOptions } from "@/features/users/types";

export async function getUserFormOptions(
  isGlobalAdmin: boolean,
  scopedSubdomainId: string | null,
): Promise<UserFormOptions> {
  const [allRoles, subdomains] = await Promise.all([
    prisma.role.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    isGlobalAdmin
      ? prisma.subdomain.findMany({
          where: { is_active: true },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
  ]);

  return {
    roles: filterAssignableRoles(allRoles, isGlobalAdmin),
    subdomains,
    isGlobalAdmin,
    defaultSubdomainId: scopedSubdomainId,
  };
}
