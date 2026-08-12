import type { Prisma } from "@/generated/prisma/client";
import { normalizeBusinessDate } from "@/lib/business-date";
import prisma from "@/lib/prisma";

type Tx = Prisma.TransactionClient;

/**
 * Soft parent for cage+date daily inputs. Idempotent upsert.
 */
export async function ensureDailyReport(
  tenantId: string,
  cageId: string,
  recordDate: Date,
  db: Tx | typeof prisma = prisma,
): Promise<{ id: string }> {
  const date = normalizeBusinessDate(recordDate);
  const existing = await db.dailyReport.findUnique({
    where: {
      tenant_id_cage_id_record_date: {
        tenant_id: tenantId,
        cage_id: cageId,
        record_date: date,
      },
    },
    select: { id: true },
  });

  if (existing) {
    return existing;
  }

  try {
    return await db.dailyReport.create({
      data: {
        tenant_id: tenantId,
        cage_id: cageId,
        record_date: date,
      },
      select: { id: true },
    });
  } catch {
    const raced = await db.dailyReport.findUnique({
      where: {
        tenant_id_cage_id_record_date: {
          tenant_id: tenantId,
          cage_id: cageId,
          record_date: date,
        },
      },
      select: { id: true },
    });
    if (raced) return raced;
    throw new Error("Gagal membuat laporan harian.");
  }
}
