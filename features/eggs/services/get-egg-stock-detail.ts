import prisma from "@/lib/prisma";
import { eggDirectionOf } from "@/features/eggs/lib/egg-mutation-types";
import type { EggStockGradeDetail } from "@/features/eggs/types";

/**
 * Kartu stok telur satu grade: saldo per lokasi + ledger mutasi (terisolasi
 * tenant). Null ketika grade tidak ditemukan.
 */
export async function getEggStockGradeDetail(
  tenantId: string,
  gradeId: number,
): Promise<EggStockGradeDetail | null> {
  const grade = await prisma.eggGrade.findUnique({
    where: { id: gradeId },
    select: { id: true, code: true, name: true },
  });

  if (!grade) return null;

  const [stocks, movements] = await Promise.all([
    prisma.eggStock.findMany({
      where: { tenant_id: tenantId, egg_grade_id: gradeId },
      select: {
        location_id: true,
        quantity: true,
        location: { select: { name: true } },
      },
      orderBy: { quantity: "desc" },
    }),
    prisma.eggMovement.findMany({
      where: { tenant_id: tenantId, egg_grade_id: gradeId },
      orderBy: { mutation_date: "desc" },
      take: 100,
      select: {
        id: true,
        mutation_type: true,
        quantity: true,
        reference_id: true,
        mutation_date: true,
        location: { select: { name: true } },
      },
    }),
  ]);

  const totalQuantity = stocks.reduce((sum, s) => sum + s.quantity, 0);

  return {
    gradeId: grade.id,
    code: grade.code,
    name: grade.name,
    totalQuantity,
    stockByLocation: stocks.map((s) => ({
      locationId: s.location_id,
      locationName: s.location.name,
      quantity: s.quantity,
    })),
    movements: movements.map((m) => ({
      id: m.id,
      mutationType: m.mutation_type,
      direction: eggDirectionOf(m.mutation_type),
      quantity: m.quantity,
      referenceId: m.reference_id,
      mutationDate: m.mutation_date.toISOString(),
      locationName: m.location.name,
    })),
  };
}