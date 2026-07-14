import { startOfTodayUtc } from "@/features/production/lib/parse-production-date";
import prisma from "@/lib/prisma";

export type PopulationMutationRecapRow = {
  id: string;
  recordDate: Date;
  cageId: string;
  cageName: string;
  locationName: string;
  mutationType: string;
  quantity: number;
  notes: string | null;
  recordedBy: string;
  createdAt: Date;
};

export async function listPopulationMutationRecap(
  tenantId: string,
  recordDate = startOfTodayUtc(),
): Promise<PopulationMutationRecapRow[]> {
  const rows = await prisma.populationMutation.findMany({
    where: {
      cage: { location: { tenant_id: tenantId } },
      record_date: recordDate,
    },
    include: {
      cage: {
        select: {
          id: true,
          name: true,
          location: { select: { name: true } },
        },
      },
      user: { select: { full_name: true, username: true } },
    },
    orderBy: [{ cage: { name: "asc" } }, { created_at: "asc" }],
  });

  return rows.map((row) => ({
    id: row.id,
    recordDate: row.record_date,
    cageId: row.cage.id,
    cageName: row.cage.name,
    locationName: row.cage.location.name,
    mutationType: row.mutation_type,
    quantity: row.quantity,
    notes: row.notes,
    recordedBy: row.user.full_name || row.user.username,
    createdAt: row.created_at,
  }));
}
