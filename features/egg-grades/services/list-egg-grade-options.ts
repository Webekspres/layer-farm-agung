import prisma from "@/lib/prisma";

/** Grade aktif saja — input baru hanya boleh memakai kategori aktif (laporan revisi 1 §1.2). */
export async function listEggGradeOptions() {
  return prisma.eggGrade.findMany({
    where: { is_active: true },
    select: { id: true, name: true, code: true, is_active: true },
    orderBy: [{ sort_order: "asc" }, { name: "asc" }],
  });
}
