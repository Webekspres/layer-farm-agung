import prisma from "../lib/prisma";
import { createUserWithCredential } from "@/features/auth/services/create-user";
import { WIRED_PERMISSIONS } from "@/features/permissions/config/wired-permissions";
import {
  ADMIN_ROLE_NAME,
  resolveRolePermissionNames,
  STAFF_ROLE_NAME,
  SUPERADMIN_ROLE_NAME,
  SYSTEM_ROLES,
} from "@/features/roles/config/system-roles";

async function main() {
  const roleRecords = await Promise.all(
    Object.values(SYSTEM_ROLES).map((definition) =>
      prisma.role.upsert({
        where: { name: definition.name },
        update: { description: definition.description },
        create: {
          name: definition.name,
          description: definition.description,
        },
      }),
    ),
  );

  const roleByName = Object.fromEntries(
    roleRecords.map((role) => [role.name, role]),
  );

  const permissionRecords = await Promise.all(
    WIRED_PERMISSIONS.map((name) =>
      prisma.permission.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  const permissionByName = Object.fromEntries(
    permissionRecords.map((p) => [p.name, p]),
  );

  for (const definition of Object.values(SYSTEM_ROLES)) {
    const role = roleByName[definition.name];
    const permissionNames = resolveRolePermissionNames(definition);

    for (const permissionName of permissionNames) {
      const permission = permissionByName[permissionName];
      if (!permission) continue;

      await prisma.rolePermission.upsert({
        where: {
          role_id_permission_id: {
            role_id: role.id,
            permission_id: permission.id,
          },
        },
        update: {},
        create: {
          role_id: role.id,
          permission_id: permission.id,
        },
      });
    }
  }

  const defaultBranch = await prisma.subdomain.upsert({
    where: { subdomain_url: "cabang-utama" },
    update: { name: "Cabang Utama" },
    create: {
      name: "Cabang Utama",
      subdomain_url: "cabang-utama",
      is_active: true,
    },
  });

  const superadminRole = roleByName[SUPERADMIN_ROLE_NAME];
  const adminRole = roleByName[ADMIN_ROLE_NAME];
  const staffRole = roleByName[STAFF_ROLE_NAME];

  const superadminUsername = "superadmin";
  const existingSuperadmin = await prisma.user.findUnique({
    where: { username: superadminUsername },
  });

  if (!existingSuperadmin) {
    await createUserWithCredential({
      fullName: "Super Admin",
      username: superadminUsername,
      email: "superadmin@layerfarm.local",
      password: "ChangeMe123!",
      roleId: superadminRole.id,
      subdomainId: null,
      isActive: true,
    });
  }

  const branchAdminUsername = "admin.cabang";
  const existingBranchAdmin = await prisma.user.findUnique({
    where: { username: branchAdminUsername },
  });

  if (!existingBranchAdmin) {
    await createUserWithCredential({
      fullName: "Admin Cabang Utama",
      username: branchAdminUsername,
      email: "admin@cabang-utama.local",
      password: "ChangeMe123!",
      roleId: adminRole.id,
      subdomainId: defaultBranch.id,
      isActive: true,
    });
  }

  const staffUsername = "staff.kandang";
  const existingStaff = await prisma.user.findUnique({
    where: { username: staffUsername },
  });

  if (!existingStaff) {
    await createUserWithCredential({
      fullName: "Staff Kandang",
      username: staffUsername,
      email: "staff@cabang-utama.local",
      password: "ChangeMe123!",
      roleId: staffRole.id,
      subdomainId: defaultBranch.id,
      isActive: true,
    });
  }

  console.log("Seed selesai.");
  console.log("Superadmin: superadmin / ChangeMe123!");
  console.log("Admin cabang: admin.cabang / ChangeMe123!");
  console.log("Staff kandang: staff.kandang / ChangeMe123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
