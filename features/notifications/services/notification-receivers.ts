import prisma from "@/lib/prisma";
import { ADMIN_ROLE_NAME } from "@/features/roles/config/system-roles";

/** Pengguna admin tenant yang aktif (penerima notifikasi level tenant). */
export async function listTenantAdminUsers(tenantId: string) {
  const users = await prisma.user.findMany({
    where: {
      tenant_id: tenantId,
      is_active: true,
      role: { name: ADMIN_ROLE_NAME },
    },
    select: { id: true, full_name: true },
  });

  return users;
}

/** Staff aktif yang ditugaskan ke kandang tertentu. */
export async function listCageStaffUsers(cageId: string) {
  const rows = await prisma.cageStaffAssignment.findMany({
    where: {
      cage_id: cageId,
      user: { is_active: true },
    },
    include: {
      user: { select: { id: true, full_name: true } },
    },
  });

  return rows.map((row) => ({
    id: row.user.id,
    fullName: row.user.full_name,
  }));
}