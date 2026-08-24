/**
 * Seed khusus UAT tenant terisolasi (TC-01 s/d TC-05).
 *
 * Membuat tenant "Tenant UAT (Pengujian)" lengkap dengan:
 * - Akun admin.uat & staff.uat (role Admin/Staf global)
 * - Kandang Uji A dengan SATU siklus lama berstatus Completed + riwayat data
 *   (produksi, pakan, mortalitas) → untuk pembuktian isolasi siklus (TC-01)
 * - Master grade TB/TR/TP aktif, lokasi, strain, pakan + stok awal 1000 kg
 * - Kebijakan input lookback staf 7 / admin 30 hari
 *
 * SENGJAHA TANPA siklus aktif baru — siklus baru dibuat penguji lewat UI (TC-01).
 * Idempoten: aman dijalankan berulang (upsert / find-first).
 *
 * Jalankan terhadap Neon:
 *   DATABASE_URL="postgresql://...pooler...neon.tech/neondb?sslmode=require" \
 *     bun run db:seed:uat
 */
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

const UAT_TENANT_SLUG = "uat-aapm";
const UAT_TENANT_NAME = "Tenant UAT (Pengujian)";
const UAT_LOCATION_ID = "00000000-0000-4000-8000-00000000a001";
const UAT_FEED_ITEM_ID = "00000000-0000-4000-8000-00000000a101";
const CAGE_NAME = "Kandang Uji A";
const STAFF_PASSWORD = "password123";

/** Riwayat 7 hari terakhir siklus lama (hari ke-−47 s/d −41 relatif hari ini). */
const OLD_CYCLE_PRODUCTION_7D = [
  { tb: 3960, tr: 14, tp: 6, feedKg: 505, mati: 7 },
  { tb: 4020, tr: 11, tp: 4, feedKg: 512, mati: 5 },
  { tb: 3985, tr: 16, tp: 8, feedKg: 509, mati: 9 },
  { tb: 4054, tr: 10, tp: 5, feedKg: 518, mati: 4 },
  { tb: 3990, tr: 13, tp: 6, feedKg: 515, mati: 8 },
  { tb: 4041, tr: 12, tp: 7, feedKg: 520, mati: 6 },
  { tb: 4010, tr: 15, tp: 4, feedKg: 516, mati: 6 },
] as const;

async function ensureRolesAndPermissions() {
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
    for (const permissionName of resolveRolePermissionNames(definition)) {
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
        create: { role_id: role.id, permission_id: permission.id },
      });
    }
  }

  return roleByName;
}

async function main() {
  const roleByName = await ensureRolesAndPermissions();

  const uatTenant = await prisma.tenant.upsert({
    where: { slug: UAT_TENANT_SLUG },
    update: { name: UAT_TENANT_NAME, is_active: true },
    create: {
      name: UAT_TENANT_NAME,
      slug: UAT_TENANT_SLUG,
      is_active: true,
      brand_name: "UAT Poultry",
      logo_url: "/assets/logos/aapm-default.png",
    },
  });

  // ── Akun UAT ──────────────────────────────────────────────────────────────
  const adminUsername = "admin.uat";
  if (!(await prisma.user.findUnique({ where: { username: adminUsername } }))) {
    await createUserWithCredential({
      fullName: "Admin UAT",
      username: adminUsername,
      email: "admin.uat@layerfarm.local",
      password: STAFF_PASSWORD,
      roleId: roleByName[ADMIN_ROLE_NAME].id,
      tenantId: uatTenant.id,
      isActive: true,
    });
  }

  const staffUsername = "staff.uat";
  if (!(await prisma.user.findUnique({ where: { username: staffUsername } }))) {
    await createUserWithCredential({
      fullName: "Staff UAT",
      username: staffUsername,
      email: "staff.uat@layerfarm.local",
      password: STAFF_PASSWORD,
      roleId: roleByName[STAFF_ROLE_NAME].id,
      tenantId: uatTenant.id,
      isActive: true,
    });
  }
  const staffUser = await prisma.user.findUniqueOrThrow({
    where: { username: staffUsername },
    select: { id: true },
  });

  // ── Grade telur produksi (katalog global, sama dengan seed utama) ────────
  const productionGrades = [
    { code: "TB", name: "Telur Bagus", description: "Telur layak jual / konsumsi", sortOrder: 1 },
    { code: "TR", name: "Telur Retak", description: "Telur retak (termasuk rincian telur pecah)", sortOrder: 2 },
    { code: "TP", name: "Telur Putih", description: "Telur putih (referensi ERP AAPM)", sortOrder: 3 },
  ] as const;
  const gradeIdByCode = new Map<string, number>();
  for (const g of productionGrades) {
    const record = await prisma.eggGrade.upsert({
      where: { code: g.code },
      update: { is_active: true, sort_order: g.sortOrder },
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

  // ── Strain (global) ───────────────────────────────────────────────────────
  const strain = await prisma.strain.upsert({
    where: { name: "Lohmann Brown" },
    update: {},
    create: { name: "Lohmann Brown", description: "Strain layer standar" },
  });

  // ── Lokasi & Kandang Uji A ────────────────────────────────────────────────
  const location = await prisma.location.upsert({
    where: { id: UAT_LOCATION_ID },
    update: { name: "Lokasi UAT" },
    create: {
      id: UAT_LOCATION_ID,
      tenant_id: uatTenant.id,
      name: "Lokasi UAT",
    },
  });

  let cage = await prisma.cage.findFirst({
    where: { location_id: location.id, name: CAGE_NAME },
  });
  if (!cage) {
    const { generateCageQrCode } =
      await import("@/features/cages/lib/generate-qr-code");
    cage = await prisma.cage.create({
      data: {
        location_id: location.id,
        strain_id: strain.id,
        name: CAGE_NAME,
        cage_type: "Closed house",
        capacity: 5000,
        status: "Active",
        qr_code: generateCageQrCode(),
      },
    });
  }

  const { upsertCageStaffAssignment } =
    await import("@/features/cages/lib/cage-staff-db");
  await upsertCageStaffAssignment(cage.id, staffUser.id);

  // ── Kebijakan input (poin 2 laporan): staf 7 hari / admin 30 hari ────────
  await prisma.tenantProductionSetting.upsert({
    where: { tenant_id: uatTenant.id },
    update: { staff_lookback_days: 7, admin_lookback_days: 30 },
    create: {
      tenant_id: uatTenant.id,
      staff_lookback_days: 7,
      admin_lookback_days: 30,
    },
  });

  // ── Item pakan + stok awal (untuk reversal TC-04) ─────────────────────────
  await prisma.item.upsert({
    where: { id: UAT_FEED_ITEM_ID },
    update: { name: "Pakan Layer UAT", type: ItemType.Feed, unit: "kg" },
    create: {
      id: UAT_FEED_ITEM_ID,
      tenant_id: uatTenant.id,
      name: "Pakan Layer UAT",
      type: ItemType.Feed,
      unit: "kg",
      min_stock_alert: 100,
    },
  });
  await prisma.inventoryStock.upsert({
    where: {
      item_id_location_id: {
        item_id: UAT_FEED_ITEM_ID,
        location_id: location.id,
      },
    },
    update: {},
    create: {
      item_id: UAT_FEED_ITEM_ID,
      location_id: location.id,
      quantity: 1000,
    },
  });

  // ── Siklus lama berstatus Completed + riwayat 7 hari (isolasi TC-01) ─────
  const todayBiz = todayBusinessDateValue();
  let oldCycle = await prisma.cycleSetting.findFirst({
    where: { cage_id: cage.id, status: "Completed" },
  });
  if (!oldCycle) {
    oldCycle = await prisma.cycleSetting.create({
      data: {
        cage_id: cage.id,
        start_date: shiftBusinessDate(todayBiz, -140),
        go_live_date: shiftBusinessDate(todayBiz, -140),
        end_date: shiftBusinessDate(todayBiz, -41),
        initial_population: 4800,
        status: "Completed",
      },
    });
  }

  for (let offset = 47; offset >= 41; offset -= 1) {
    const sample = OLD_CYCLE_PRODUCTION_7D[47 - offset]!;
    const recordDate = shiftBusinessDate(todayBiz, -offset);

    const existingProduction = await prisma.dailyProduction.findFirst({
      where: {
        tenant_id: uatTenant.id,
        cage_id: cage.id,
        record_date: recordDate,
      },
      select: { id: true },
    });
    if (!existingProduction) {
      const created = await prisma.dailyProduction.create({
        data: {
          tenant_id: uatTenant.id,
          cage_id: cage.id,
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
        data: [
          { grade: sample.tb, code: "TB" },
          { grade: sample.tr, code: "TR" },
          { grade: sample.tp, code: "TP" },
        ].map((item) => ({
          production_id: created.id,
          egg_grade_id: gradeIdByCode.get(item.code)!,
          quantity: item.grade,
        })),
      });
    }

    const existingFeed = await prisma.feedConsumption.findFirst({
      where: {
        tenant_id: uatTenant.id,
        cage_id: cage.id,
        record_date: recordDate,
      },
      select: { id: true },
    });
    if (!existingFeed) {
      await prisma.feedConsumption.create({
        data: {
          tenant_id: uatTenant.id,
          cage_id: cage.id,
          item_id: UAT_FEED_ITEM_ID,
          user_id: staffUser.id,
          record_date: recordDate,
          quantity: sample.feedKg,
          is_synced: true,
        },
      });
    }

    const existingMortality = await prisma.populationMutation.findFirst({
      where: {
        cage_id: cage.id,
        record_date: recordDate,
        mutation_type: "Mati",
      },
      select: { id: true },
    });
    if (!existingMortality) {
      await prisma.populationMutation.create({
        data: {
          cage_id: cage.id,
          user_id: staffUser.id,
          mutation_type: "Mati",
          quantity: sample.mati,
          notes: "Mortalitas harian (data siklus lama)",
          record_date: recordDate,
          is_synced: true,
        },
      });
    }
  }

  console.log("Seed UAT selesai.");
  console.log(`Tenant : ${UAT_TENANT_NAME} (${uatTenant.id})`);
  console.log(`Kandang: ${CAGE_NAME} (siklus lama Completed, TANPA siklus aktif)`);
  console.log(`Stok pakan awal: 1000 kg (Pakan Layer UAT @ ${location.name})`);
  console.log("Admin web : admin.uat / password123");
  console.log("Staf HP   : staff.uat / password123");
  console.log("");
  console.log("Langkah pertama penguji: TC-01 — buat siklus baru via UI");
  console.log("(Start Date H-40, Go-Live Date hari ini, Initial Population 5000).");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
