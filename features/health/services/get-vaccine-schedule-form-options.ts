import prisma from "@/lib/prisma";
import { ItemType } from "@/generated/prisma/enums";
import type { VaccineScheduleFormOptions } from "@/features/health/types";

/** Cage + vaccine-item options for the "Buat jadwal vaksinasi" dialog. */
export async function getVaccineScheduleFormOptions(
  tenantId: string,
): Promise<VaccineScheduleFormOptions> {
  const [cages, vaccineItems] = await Promise.all([
    prisma.cage.findMany({
      where: { location: { tenant_id: tenantId } },
      select: { id: true, name: true, location: { select: { name: true } } },
      orderBy: [{ location: { name: "asc" } }, { name: "asc" }],
    }),
    prisma.item.findMany({
      where: { tenant_id: tenantId, type: ItemType.Vaccine },
      select: { id: true, name: true, unit: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    cages: cages.map((c) => ({
      id: c.id,
      name: c.name,
      locationName: c.location.name,
    })),
    vaccineItems,
  };
}
