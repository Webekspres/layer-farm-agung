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

  const defaultTenant = await prisma.tenant.upsert({
    where: { slug: "cabang-utama" },
    update: {
      name: "Tenant Utama",
      brand_name: "Utama Poultry",
      logo_url: "/assets/logos/aapm-default.png",
    },
    create: {
      name: "Tenant Utama",
      slug: "cabang-utama",
      is_active: true,
      brand_name: "Utama Poultry",
      logo_url: "/assets/logos/aapm-default.png",
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
      password: "password123",
      roleId: superadminRole.id,
      tenantId: null,
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
      password: "password123",
      roleId: adminRole.id,
      tenantId: defaultTenant.id,
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
      password: "password123",
      roleId: staffRole.id,
      tenantId: defaultTenant.id,
      isActive: true,
    });
  }

  const strainLohmann = await prisma.strain.upsert({
    where: { name: "Lohmann Brown" },
    update: {},
    create: {
      name: "Lohmann Brown",
      description: "Strain layer standar",
    },
  });

  await prisma.strain.upsert({
    where: { name: "Hy-Line" },
    update: {},
    create: {
      name: "Hy-Line",
      description: "Strain layer alternatif",
    },
  });

  for (const [name, description] of [
    ["A", "Grade A"],
    ["B", "Grade B"],
    ["C", "Grade C"],
  ] as const) {
    await prisma.eggGrade.upsert({
      where: { name },
      update: { description },
      create: { name, description },
    });
  }

  const mainLocation = await prisma.location.upsert({
    where: { id: "00000000-0000-4000-8000-000000000001" },
    update: { name: "Kawasan Utama" },
    create: {
      id: "00000000-0000-4000-8000-000000000001",
      tenant_id: defaultTenant.id,
      name: "Kawasan Utama",
    },
  });

  const existingCage = await prisma.cage.findFirst({
    where: {
      location_id: mainLocation.id,
      name: "Kandang 1",
    },
  });

  if (!existingCage) {
    const cage = await prisma.cage.create({
      data: {
        location_id: mainLocation.id,
        strain_id: strainLohmann.id,
        name: "Kandang 1",
        cage_type: "Closed house",
        capacity: 5000,
        status: "Active",
      },
    });

    await prisma.cycleSetting.create({
      data: {
        cage_id: cage.id,
        start_date: new Date("2025-01-01"),
        initial_population: 4800,
        status: "Active",
      },
    });
  }

  await prisma.vendor.upsert({
    where: { id: "00000000-0000-4000-8000-000000000010" },
    update: { name: "PT Pakan Sejahtera" },
    create: {
      id: "00000000-0000-4000-8000-000000000010",
      tenant_id: defaultTenant.id,
      name: "PT Pakan Sejahtera",
      category: "Pakan",
      address: "Jl. Contoh No. 1",
    },
  });

  console.log("Seed selesai.");
  console.log("Superadmin: superadmin / password123!");
  console.log("Admin tenant: admin.cabang / password123!");
  console.log("Staff kandang: staff.kandang / password123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
