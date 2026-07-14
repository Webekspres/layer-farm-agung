import { PageHeader } from "@/components/layout/page-header";
import { requirePermission } from "@/features/auth/lib/require-permission";
import { RolesManagement } from "@/features/roles/components/roles-management";
import { listRolesWithPermissions } from "@/features/roles/services/list-roles";

export default async function RolesPage() {
  await requirePermission("manage_roles");

  const { roles, permissions } = await listRolesWithPermissions();

  return (
    <>
      <PageHeader
        title="Peran & Akses"
        description="Kelola permission per peran secara dinamis. Perubahan langsung memengaruhi menu dan akses pengguna."
      />
      <RolesManagement roles={roles} permissions={permissions} />
    </>
  );
}
