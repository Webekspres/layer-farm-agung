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
import {
  shiftBusinessDate,
  todayBusinessDateValue,
} from "@/lib/business-date";

/** TB ~85–92% of 4800 pop — slight day-to-day variation for chart demo. */
const DEMO_PRODUCTION_7D = [
  { tb: 4120, tr: 12, tp: 4 },
  { tb: 4200, tr: 10, tp: 5 },
  { tb: 4280, tr: 8, tp: 3 },
  { tb: 4350, tr: 9, tp: 6 },
  { tb: 4180, tr: 14, tp: 7 },
  { tb: 4300, tr: 11, tp: 4 },
  { tb: 4224, tr: 10, tp: 5 },
] as const;

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

  // Grade produksi (sumber klasifikasi panen — sesuai ERP AAPM; TP = Telur Putih).
  const productionGrades = [
    {
      code: "TB",
      name: "Telur Bagus",
      description: "Telur layak jual / konsumsi",
      sortOrder: 1,
    },
    {
      code: "TR",
      name: "Telur Retak",
      description: "Telur retak (termasuk rincian telur pecah)",
      sortOrder: 2,
    },
    {
      code: "TP",
      name: "Telur Putih",
      description: "Telur putih (referensi ERP AAPM)",
      sortOrder: 3,
    },
  ] as const;
  const gradeIdByCode = new Map<string, number>();
  for (const g of productionGrades) {
    const record = await prisma.eggGrade.upsert({
      where: { code: g.code },
      update: {
        name: g.name,
        description: g.description,
        is_active: true,
        sort_order: g.sortOrder,
      },
      create: {
        code: g.code,
        name: g.name,
        description: g.description,
        is_active: true,
        sort_order: g.sortOrder,
      },
    });
    gradeIdByCode.set(g.code, record.id);
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

    // Demo 7-day production so mobile Home charts (produksi / HDP) have signal.
    const todayBiz = todayBusinessDateValue();
    for (let offset = 6; offset >= 0; offset -= 1) {
      const dayIndex = 6 - offset;
      const sample = DEMO_PRODUCTION_7D[dayIndex]!;
      const recordDate = shiftBusinessDate(todayBiz, -offset);
      const existing = await prisma.dailyProduction.findFirst({
        where: {
          tenant_id: defaultTenant.id,
          cage_id: seedCage.id,
          record_date: recordDate,
        },
        select: { id: true },
      });

      const gradeItems = [
        { code: "TB", quantity: sample.tb },
        { code: "TR", quantity: sample.tr },
        { code: "TP", quantity: sample.tp },
      ]
        .filter((item) => item.quantity > 0)
        .map((item) => ({
          egg_grade_id: gradeIdByCode.get(item.code)!,
          quantity: item.quantity,
        }));

      if (existing) {
        await prisma.dailyProduction.update({
          where: { id: existing.id },
          data: {
            user_id: staffUser.id,
            tb: sample.tb,
            tr: sample.tr,
            tp: sample.tp,
            weight: 62,
            is_synced: true,
          },
        });
        await prisma.dailyProductionItem.deleteMany({
          where: { production_id: existing.id },
        });
        await prisma.dailyProductionItem.createMany({
          data: gradeItems.map((item) => ({
            production_id: existing.id,
            egg_grade_id: item.egg_grade_id,
            quantity: item.quantity,
          })),
        });
      } else {
        const created = await prisma.dailyProduction.create({
          data: {
            tenant_id: defaultTenant.id,
            cage_id: seedCage.id,
            user_id: staffUser.id,
            record_date: recordDate,
            tb: sample.tb,
            tr: sample.tr,
            tp: sample.tp,
            weight: 62,
            is_synced: true,
          },
          select: { id: true },
        });
        await prisma.dailyProductionItem.createMany({
          data: gradeItems.map((item) => ({
            production_id: created.id,
            egg_grade_id: item.egg_grade_id,
            quantity: item.quantity,
          })),
        });
      }
    }
  }

  // Target HDP for Lohmann — lookup uses age_in_weeks <= flock age.
  const existingTarget = await prisma.productionTarget.findFirst({
    where: {
      strain_id: strainLohmann.id,
      age_in_weeks: 20,
    },
    select: { id: true },
  });
  if (existingTarget) {
    await prisma.productionTarget.update({
      where: { id: existingTarget.id },
      data: { target_hdp: 90, target_fcr: 2.1 },
    });
  } else {
    await prisma.productionTarget.create({
      data: {
        strain_id: strainLohmann.id,
        age_in_weeks: 20,
        target_hdp: 90,
        target_fcr: 2.1,
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
    {
      id: "00000000-0000-4000-8000-000000000301",
      name: "ND Hitchner B1",
      type: ItemType.Vaccine,
      unit: "dosis",
      min_stock_alert: 100,
      initialStock: 500,
    },
    {
      id: "00000000-0000-4000-8000-000000000302",
      name: "IB H120",
      type: ItemType.Vaccine,
      unit: "dosis",
      min_stock_alert: 100,
      initialStock: 500,
    },
    {
      id: "00000000-0000-4000-8000-000000000303",
      name: "Gumboro Intermediate",
      type: ItemType.Vaccine,
      unit: "dosis",
      min_stock_alert: 80,
      initialStock: 400,
    },
    {
      id: "00000000-0000-4000-8000-000000000304",
      name: "ND Lasota",
      type: ItemType.Vaccine,
      unit: "dosis",
      min_stock_alert: 100,
      initialStock: 500,
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

  // Program vaksin default (pola umur dari Excel Vaccine Regime — subset).
  const defaultVaccineProgramId = "00000000-0000-4000-8000-000000000401";
  await prisma.vaccineProgram.upsert({
    where: { id: defaultVaccineProgramId },
    update: {
      name: "Program default (demo)",
      strain_id: null,
      is_active: true,
    },
    create: {
      id: defaultVaccineProgramId,
      tenant_id: defaultTenant.id,
      name: "Program default (demo)",
      strain_id: null,
      is_active: true,
    },
  });

  const demoProgramSteps = [
    {
      id: "00000000-0000-4000-8000-000000000411",
      age_days: 1,
      item_id: "00000000-0000-4000-8000-000000000301",
      pathogen_label: "ND",
      formulation_type: "Live",
      sort_order: 0,
    },
    {
      id: "00000000-0000-4000-8000-000000000412",
      age_days: 1,
      item_id: "00000000-0000-4000-8000-000000000302",
      pathogen_label: "IB",
      formulation_type: "Live",
      sort_order: 1,
    },
    {
      id: "00000000-0000-4000-8000-000000000413",
      age_days: 6,
      item_id: "00000000-0000-4000-8000-000000000202",
      pathogen_label: null,
      formulation_type: "Suspensi",
      sort_order: 0,
    },
    {
      id: "00000000-0000-4000-8000-000000000414",
      age_days: 12,
      item_id: "00000000-0000-4000-8000-000000000303",
      pathogen_label: "IBD",
      formulation_type: "Live",
      sort_order: 0,
    },
    {
      id: "00000000-0000-4000-8000-000000000415",
      age_days: 21,
      item_id: "00000000-0000-4000-8000-000000000304",
      pathogen_label: "ND",
      formulation_type: "Live",
      sort_order: 0,
    },
  ] as const;

  for (const step of demoProgramSteps) {
    await prisma.vaccineProgramStep.upsert({
      where: { id: step.id },
      update: {
        age_days: step.age_days,
        item_id: step.item_id,
        pathogen_label: step.pathogen_label,
        formulation_type: step.formulation_type,
        sort_order: step.sort_order,
        program_id: defaultVaccineProgramId,
      },
      create: {
        id: step.id,
        program_id: defaultVaccineProgramId,
        age_days: step.age_days,
        item_id: step.item_id,
        pathogen_label: step.pathogen_label,
        formulation_type: step.formulation_type,
        sort_order: step.sort_order,
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
