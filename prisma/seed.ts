import prisma from "../lib/prisma";
import { createUserWithCredential } from "@/features/auth/services/create-user";

const PERMISSIONS = [
  "view_dashboard",
  "manage_users",
  "manage_roles",
  "view_cashflow",
  "manage_production",
  "manage_inventory",
] as const;

async function main() {
  const superadminRole = await prisma.role.upsert({
    where: { name: "superadmin" },
    update: { description: "Superadmin global (semua cabang)" },
    create: {
      name: "superadmin",
      description: "Superadmin global (semua cabang)",
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: { description: "Admin cabang" },
    create: {
      name: "admin",
      description: "Admin cabang",
    },
  });

  const permissionRecords = await Promise.all(
    PERMISSIONS.map((name) =>
      prisma.permission.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  for (const permission of permissionRecords) {
    await prisma.rolePermission.upsert({
      where: {
        role_id_permission_id: {
          role_id: superadminRole.id,
          permission_id: permission.id,
        },
      },
      update: {},
      create: {
        role_id: superadminRole.id,
        permission_id: permission.id,
      },
    });
  }

  const adminPermissions = permissionRecords.filter(
    (p) => p.name !== "manage_roles",
  );

  for (const permission of adminPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        role_id_permission_id: {
          role_id: adminRole.id,
          permission_id: permission.id,
        },
      },
      update: {},
      create: {
        role_id: adminRole.id,
        permission_id: permission.id,
      },
    });
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

  console.log("Seed selesai.");
  console.log("Superadmin: superadmin / ChangeMe123!");
  console.log("Admin cabang: admin.cabang / ChangeMe123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
