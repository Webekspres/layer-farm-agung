import prisma from "@/lib/prisma";

type EggGradeRow = {
  id: number;
  name: string;
  code: string | null;
  is_active: boolean;
};

/** Grade aktif saja — input baru hanya boleh memakai kategori aktif (laporan revisi 1 §1.2). */
export async function listEggGradeOptions() {
  const rows = await prisma.eggGrade.findMany({
    where: { is_active: true },
    select: { id: true, name: true, code: true, is_active: true },
    orderBy: [{ sort_order: "asc" }, { name: "asc" }],
  });

  return rows.map((row: EggGradeRow) => ({
    id: row.id,
    name: row.name,
    code: row.code,
    isActive: row.is_active,
  }));
}
