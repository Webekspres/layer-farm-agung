import prisma from "@/lib/prisma";

export async function listEggGradeOptions() {
  return prisma.eggGrade.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}
