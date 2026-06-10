import prisma from "@/lib/prisma";

export type DailyProductionRecapRow = {
  id: string;
  recordDate: Date;
  cageName: string;
  locationName: string;
  eggGradeName: string;
  quantity: number;
  eggCrack: number;
  weight: number | null;
  recordedBy: string;
  createdAt: Date;
};

function startOfTodayUtc() {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

export async function listDailyProductionRecap(
  tenantId: string,
  recordDate = startOfTodayUtc(),
): Promise<DailyProductionRecapRow[]> {
  const rows = await prisma.dailyProduction.findMany({
    where: {
      tenant_id: tenantId,
      record_date: recordDate,
    },
    include: {
      cage: {
        select: {
          name: true,
          location: { select: { name: true } },
        },
      },
      egg_grade: { select: { name: true } },
      user: { select: { full_name: true, username: true } },
    },
    orderBy: [{ cage: { name: "asc" } }, { egg_grade: { name: "asc" } }],
  });

  return rows.map((row) => ({
    id: row.id,
    recordDate: row.record_date,
    cageName: row.cage.name,
    locationName: row.cage.location.name,
    eggGradeName: row.egg_grade.name,
    quantity: row.quantity,
    eggCrack: row.egg_crack,
    weight: row.weight,
    recordedBy: row.user.full_name || row.user.username,
    createdAt: row.created_at,
  }));
}
