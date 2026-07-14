import prisma from "@/lib/prisma";
import { STAFF_ROLE_NAME } from "@/features/roles/config/system-roles";

export type TenantStaffOption = {
  id: string;
  fullName: string;
  username: string;
};

export async function listTenantStaffOptions(
  tenantId: string,
): Promise<TenantStaffOption[]> {
  const rows = await prisma.user.findMany({
    where: {
      tenant_id: tenantId,
      is_active: true,
      role: { name: STAFF_ROLE_NAME },
    },
    select: {
      id: true,
      full_name: true,
      username: true,
    },
    orderBy: { full_name: "asc" },
  });

  return rows.map((row) => ({
    id: row.id,
    fullName: row.full_name,
    username: row.username,
  }));
}
