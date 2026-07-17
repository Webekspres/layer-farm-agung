import prisma from "@/lib/prisma";

export type VaccineProgramListItem = {
  id: string;
  name: string;
  isActive: boolean;
  strainId: number | null;
  strainName: string | null;
  stepCount: number;
  createdAt: string;
};

export async function listVaccinePrograms(
  tenantId: string,
): Promise<VaccineProgramListItem[]> {
  const rows = await prisma.vaccineProgram.findMany({
    where: { tenant_id: tenantId },
    orderBy: [{ is_active: "desc" }, { name: "asc" }],
    include: {
      strain: { select: { name: true } },
      _count: { select: { steps: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    isActive: row.is_active,
    strainId: row.strain_id,
    strainName: row.strain?.name ?? null,
    stepCount: row._count.steps,
    createdAt: row.created_at.toISOString(),
  }));
}
