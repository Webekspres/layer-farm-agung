import prisma from "@/lib/prisma";
import { ItemType } from "@/generated/prisma/enums";

export type VaccineProgramDetail = {
  id: string;
  name: string;
  isActive: boolean;
  strainId: number | null;
  steps: Array<{
    id: string;
    ageDays: number;
    itemId: string;
    pathogenLabel: string | null;
    formulationType: string | null;
    notes: string | null;
    sortOrder: number;
  }>;
};

export type VaccineProgramFormOptions = {
  strains: Array<{ id: number; name: string }>;
  items: Array<{ id: string; name: string; type: string; unit: string }>;
};

export async function getVaccineProgramDetail(
  tenantId: string,
  programId: string,
): Promise<VaccineProgramDetail | null> {
  const row = await prisma.vaccineProgram.findFirst({
    where: { id: programId, tenant_id: tenantId },
    include: {
      steps: { orderBy: [{ age_days: "asc" }, { sort_order: "asc" }] },
    },
  });

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    isActive: row.is_active,
    strainId: row.strain_id,
    steps: row.steps.map((s) => ({
      id: s.id,
      ageDays: s.age_days,
      itemId: s.item_id,
      pathogenLabel: s.pathogen_label,
      formulationType: s.formulation_type,
      notes: s.notes,
      sortOrder: s.sort_order,
    })),
  };
}

export async function getVaccineProgramFormOptions(
  tenantId: string,
): Promise<VaccineProgramFormOptions> {
  const [strains, items] = await Promise.all([
    prisma.strain.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.item.findMany({
      where: {
        tenant_id: tenantId,
        type: { in: [ItemType.Vaccine, ItemType.Vitamin] },
      },
      orderBy: [{ type: "asc" }, { name: "asc" }],
      select: { id: true, name: true, type: true, unit: true },
    }),
  ]);

  return { strains, items };
}
