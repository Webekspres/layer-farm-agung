import { startOfTodayUtc } from "@/features/production/lib/parse-production-date";
import prisma from "@/lib/prisma";

export type FeedConsumptionRecapRow = {
  id: string;
  recordDate: Date;
  cageId: string;
  cageName: string;
  locationName: string;
  itemName: string;
  itemUnit: string;
  quantity: number;
  notes: string | null;
  recordedBy: string;
  createdAt: Date;
};

export async function listFeedConsumptionRecap(
  tenantId: string,
  recordDate = startOfTodayUtc(),
): Promise<FeedConsumptionRecapRow[]> {
  const rows = await prisma.feedConsumption.findMany({
    where: {
      tenant_id: tenantId,
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
      item: { select: { name: true, unit: true } },
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
    itemName: row.item.name,
    itemUnit: row.item.unit,
    quantity: row.quantity,
    notes: row.notes,
    recordedBy: row.user.full_name || row.user.username,
    createdAt: row.created_at,
  }));
}
