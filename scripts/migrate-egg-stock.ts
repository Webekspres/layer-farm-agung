/**
 * One-time data migration: rebuild sellable egg stock per (grade × location)
 * from production/sales history, then remove the legacy single "Egg" Item
 * (ItemType.Egg) and its InventoryStock/StockMutation rows.
 *
 * Rules:
 * - IN  = DailyProductionItem.quantity summed per (egg_grade, cage.location_id).
 * - OUT = SalesOrderItem.quantity summed per (egg_grade, sales_order.location_id).
 *   Lines without a grade are attributed to the default sellable grade
 *   (code "TB", fallback: first active grade by sort_order).
 * - Net balance is written to EggStock (tenant-isolated); aggregate EggMovement
 *   rows are created for traceability of the opening balance.
 *
 * Safe guard: refuses to run when EggMovement rows already exist unless
 * `--force` is passed (which wipes egg stock/movements first and re-applies).
 *
 * Run:  bun scripts/migrate-egg-stock.ts
 */
import prisma from "@/lib/prisma";

async function resolveDefaultGradeId(): Promise<number> {
  const tb = await prisma.eggGrade.findFirst({
    where: { code: "TB" },
    orderBy: { sort_order: "asc" },
    select: { id: true },
  });
  if (tb) return tb.id;

  const fallback = await prisma.eggGrade.findFirst({
    where: { is_active: true },
    orderBy: [{ sort_order: "asc" }, { id: "asc" }],
    select: { id: true },
  });
  if (!fallback) {
    throw new Error("Tidak ada grade telur aktif untuk migrasi stok telur.");
  }
  return fallback.id;
}

async function run() {
  const force = process.argv.includes("--force");

  const existingMovements = await prisma.eggMovement.count();
  if (existingMovements > 0 && !force) {
    console.error(
      `Ditemukan ${existingMovements} EggMovement — migrasi sudah pernah dijalankan. ` +
        "Lewati atau jalankan ulang dengan --force.",
    );
    process.exit(1);
  }

  const defaultGradeId = await resolveDefaultGradeId();

  if (force) {
    await prisma.eggMovement.deleteMany();
    await prisma.eggStock.deleteMany();
  }

  const tenants = await prisma.tenant.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  for (const tenant of tenants) {
    // IN per (grade, location) dari riwayat produksi.
    const harvestRows = await prisma.dailyProductionItem.findMany({
      where: { production: { tenant_id: tenant.id } },
      select: {
        egg_grade_id: true,
        quantity: true,
        production: { select: { cage: { select: { location_id: true } } } },
      },
    });

    const inMap = new Map<string, number>();
    for (const row of harvestRows) {
      const key = `${row.egg_grade_id}:${row.production.cage.location_id}`;
      inMap.set(key, (inMap.get(key) ?? 0) + row.quantity);
    }

    // OUT per (grade, location) dari riwayat penjualan.
    const salesRows = await prisma.salesOrderItem.findMany({
      where: { sales_order: { tenant_id: tenant.id } },
      select: {
        egg_grade_id: true,
        quantity: true,
        sales_order: { select: { location_id: true } },
      },
    });

    const outMap = new Map<string, number>();
    for (const row of salesRows) {
      const gradeId = row.egg_grade_id ?? defaultGradeId;
      const key = `${gradeId}:${row.sales_order.location_id ?? "unknown"}`;
      if (row.sales_order.location_id == null) {
        console.warn(
          `[${tenant.name}] Penjualan tanpa lokasi tidak bisa dialokasikan — dilewati (grade ${gradeId}).`,
        );
        continue;
      }
      outMap.set(key, (outMap.get(key) ?? 0) + row.quantity);
    }

    const gradeIds = new Set<number>();
    for (const key of inMap.keys()) gradeIds.add(Number(key.split(":")[0]));
    for (const key of outMap.keys()) gradeIds.add(Number(key.split(":")[0]));

    const gradeNameById = new Map<number, string>();
    if (gradeIds.size > 0) {
      const grades = await prisma.eggGrade.findMany({
        where: { id: { in: [...gradeIds] } },
        select: { id: true, name: true },
      });
      for (const g of grades) gradeNameById.set(g.id, g.name);
      for (const id of gradeIds) {
        if (!gradeNameById.has(id)) {
          console.warn(
            `[${tenant.name}] Grade ${id} tidak ditemukan di master — dilewati.`,
          );
        }
      }
    }

    // Tulis saldo + ledger agregat per (grade, location).
    const locations = new Set<string>();
    for (const key of inMap.keys()) locations.add(key.split(":")[1]);
    for (const key of outMap.keys()) locations.add(key.split(":")[1]);

    for (const locationId of locations) {
      const locationExists = await prisma.location.findFirst({
        where: { id: locationId, tenant_id: tenant.id },
        select: { id: true },
      });
      if (!locationExists) {
        console.warn(
          `[${tenant.name}] Lokasi ${locationId} bukan milik tenant — dilewati.`,
        );
        continue;
      }

      for (const gradeId of gradeIds) {
        const inQty = inMap.get(`${gradeId}:${locationId}`) ?? 0;
        const outQty = outMap.get(`${gradeId}:${locationId}`) ?? 0;
        const net = inQty - outQty;
        if (net === 0 && inQty === 0 && outQty === 0) continue;

        const gradeName = gradeNameById.get(gradeId) ?? `grade-${gradeId}`;
        console.log(
          `[${tenant.name}] ${gradeName} @ ${locationId}: +${inQty} panen, -${outQty} jual → ${net}`,
        );

        await prisma.eggStock.upsert({
          where: {
            egg_grade_id_location_id: { egg_grade_id: gradeId, location_id: locationId },
          },
          update: { quantity: net },
          create: {
            tenant_id: tenant.id,
            egg_grade_id: gradeId,
            location_id: locationId,
            quantity: net,
          },
        });

        if (inQty > 0) {
          await prisma.eggMovement.create({
            data: {
              tenant_id: tenant.id,
              egg_grade_id: gradeId,
              location_id: locationId,
              mutation_type: "IN_HARVEST",
              quantity: inQty,
              reference_id: null,
            },
          });
        }
        if (outQty > 0) {
          await prisma.eggMovement.create({
            data: {
              tenant_id: tenant.id,
              egg_grade_id: gradeId,
              location_id: locationId,
              mutation_type: "OUT_SALES",
              quantity: outQty,
              reference_id: null,
            },
          });
        }
      }
    }

    // Hapus item Egg legacy + stok/mutasinya (history sudah dibangun ulang).
    const legacyEggItems = await prisma.item.findMany({
      where: { tenant_id: tenant.id, type: "Egg" },
      select: { id: true, name: true },
    });

    for (const eggItem of legacyEggItems) {
      await prisma.inventoryStock.deleteMany({ where: { item_id: eggItem.id } });
      await prisma.stockMutation.deleteMany({ where: { item_id: eggItem.id } });
      try {
        await prisma.item.delete({ where: { id: eggItem.id } });
        console.log(`[${tenant.name}] Hapus item telur legacy: ${eggItem.name}.`);
      } catch {
        console.warn(
          `[${tenant.name}] Item telur legacy "${eggItem.name}" tidak bisa dihapus (masih dirujuk) — dibiarkan.`,
        );
      }
    }
  }

  console.log("Migrasi stok telur selesai.");
  await prisma.$disconnect();
}

run().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});