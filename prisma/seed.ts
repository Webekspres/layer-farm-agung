import prisma from "../lib/prisma";
import { createUserWithCredential } from "@/features/auth/services/create-user";
import { WIRED_PERMISSIONS } from "@/features/permissions/config/wired-permissions";
import { ItemType } from "@/generated/prisma/enums";
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

  const staffUser = await prisma.user.findUnique({
    where: { username: staffUsername },
    select: { id: true },
  });

  let seedCage = existingCage;

  if (!seedCage) {
    const { generateCageQrCode } =
      await import("@/features/cages/lib/generate-qr-code");

    seedCage = await prisma.cage.create({
      data: {
        location_id: mainLocation.id,
        strain_id: strainLohmann.id,
        name: "Kandang 1",
        cage_type: "Closed house",
        capacity: 5000,
        status: "Active",
        qr_code: generateCageQrCode(),
      },
    });

    await prisma.cycleSetting.create({
      data: {
        cage_id: seedCage.id,
        start_date: new Date("2025-01-01"),
        initial_population: 4800,
        status: "Active",
      },
    });
  }

  if (seedCage && staffUser) {
    const { upsertCageStaffAssignment } =
      await import("@/features/cages/lib/cage-staff-db");
    await upsertCageStaffAssignment(seedCage.id, staffUser.id);
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

  // 👈 2. SUNTIK DATA MASTER PAKAN MENGGUNAKAN ENUM DENGAN ID TETAP (STATIC UUID)
  // Menggunakan static UUID agar data tidak berantakan/duplikat ketika script seed dijalankan ulang.
  const sampleFeeds = [
    {
      id: "00000000-0000-4000-8000-000000000101",
      name: "Piala 241+",
    },
    {
      id: "00000000-0000-4000-8000-000000000102",
      name: "Malindo Feedmill",
    },
  ];

  for (const feed of sampleFeeds) {
    await prisma.item.upsert({
      where: { id: feed.id },
      update: {
        name: feed.name,
        type: ItemType.Feed,
        unit: "kg",
      },
      create: {
        id: feed.id,
        tenant_id: defaultTenant.id,
        name: feed.name,
        type: ItemType.Feed,
        unit: "kg",
      },
    });
  }

  // Master item lintas tipe: obat, vitamin, telur (auto dari panen), dan lainnya (solar).
  const sampleItems = [
    {
      id: "00000000-0000-4000-8000-000000000201",
      name: "Amoksisilin",
      type: ItemType.Medicine,
      unit: "gram",
      min_stock_alert: 500,
      initialStock: 2000,
    },
    {
      id: "00000000-0000-4000-8000-000000000202",
      name: "Vitamin B Kompleks",
      type: ItemType.Vitamin,
      unit: "ml",
      min_stock_alert: 300,
      initialStock: 1000,
    },
    {
      id: "00000000-0000-4000-8000-000000000203",
      name: "Telur (persediaan)",
      type: ItemType.Egg,
      unit: "butir",
      min_stock_alert: null,
      initialStock: 0,
    },
    {
      id: "00000000-0000-4000-8000-000000000204",
      name: "Solar",
      type: ItemType.Other,
      unit: "liter",
      min_stock_alert: 50,
      initialStock: 200,
    },
  ] as const;

  for (const item of sampleItems) {
    await prisma.item.upsert({
      where: { id: item.id },
      update: {
        name: item.name,
        type: item.type,
        unit: item.unit,
        min_stock_alert: item.min_stock_alert,
      },
      create: {
        id: item.id,
        tenant_id: defaultTenant.id,
        name: item.name,
        type: item.type,
        unit: item.unit,
        min_stock_alert: item.min_stock_alert,
      },
    });

    await prisma.inventoryStock.upsert({
      where: {
        item_id_location_id: {
          item_id: item.id,
          location_id: mainLocation.id,
        },
      },
      update: {},
      create: {
        item_id: item.id,
        location_id: mainLocation.id,
        quantity: item.initialStock,
      },
    });
  }

  // Stok awal untuk pakan yang sudah di-seed sebelumnya, dengan ambang batas rendah-stok.
  for (const feed of sampleFeeds) {
    await prisma.item.update({
      where: { id: feed.id },
      data: { min_stock_alert: 100 },
    });
    await prisma.inventoryStock.upsert({
      where: {
        item_id_location_id: {
          item_id: feed.id,
          location_id: mainLocation.id,
        },
      },
      update: {},
      create: {
        item_id: feed.id,
        location_id: mainLocation.id,
        quantity: 1000,
      },
    });
  }

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
