import prisma from "@/lib/prisma";
import type { EggStockGradeRow } from "@/features/eggs/types";

/**
 * Ringkasan stok telur per grade aktif (katalog grade global). Stok dijumlahkan
 * dari `EggStock` yang sudah terisolasi `tenant_id`. Grade tanpa stok tetap
 * tampil (0) supaya staf melihat seluruh klasifikasi panen.
 */
export async function listEggStock(tenantId: string): Promise<EggStockGradeRow[]> {
  const [grades, totals] = await Promise.all([
    prisma.eggGrade.findMany({
      where: { is_active: true },
      orderBy: [{ sort_order: "asc" }, { name: "asc" }],
      select: { id: true, code: true, name: true, sort_order: true },
    }),
    prisma.eggStock.groupBy({
      by: ["egg_grade_id"],
      where: { tenant_id: tenantId },
      _sum: { quantity: true },
    }),
  ]);

  const totalByGradeId = new Map(
    totals.map((row) => [row.egg_grade_id, row._sum.quantity ?? 0]),
  );

  return grades.map((grade) => ({
    gradeId: grade.id,
    code: grade.code,
    name: grade.name,
    sortOrder: grade.sort_order,
    totalQuantity: totalByGradeId.get(grade.id) ?? 0,
  }));
}