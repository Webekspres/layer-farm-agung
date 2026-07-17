import prisma from "@/lib/prisma";
import { ItemType } from "@/generated/prisma/enums";
import type { CreateVaccineProgramInput } from "@/features/health/schemas/vaccine-program";

export type CreateVaccineProgramResult =
  | { ok: true; programId: string }
  | { ok: false; error: string };

export async function createVaccineProgram(
  tenantId: string,
  input: CreateVaccineProgramInput,
): Promise<CreateVaccineProgramResult> {
  if (input.strainId !== null) {
    const strain = await prisma.strain.findUnique({
      where: { id: input.strainId },
      select: { id: true },
    });
    if (!strain) {
      return { ok: false, error: "Strain tidak ditemukan." };
    }
  }

  const itemIds = [...new Set(input.steps.map((s) => s.itemId))];
  const items = await prisma.item.findMany({
    where: {
      id: { in: itemIds },
      tenant_id: tenantId,
      type: { in: [ItemType.Vaccine, ItemType.Vitamin] },
    },
    select: { id: true },
  });

  if (items.length !== itemIds.length) {
    return {
      ok: false,
      error: "Setiap langkah harus memakai item Vaccine atau Vitamin di tenant ini.",
    };
  }

  try {
    const program = await prisma.vaccineProgram.create({
      data: {
        tenant_id: tenantId,
        name: input.name,
        strain_id: input.strainId,
        is_active: true,
        steps: {
          create: input.steps.map((step, index) => ({
            age_days: step.ageDays,
            item_id: step.itemId,
            pathogen_label: step.pathogenLabel ?? null,
            formulation_type: step.formulationType ?? null,
            notes: step.notes ?? null,
            sort_order: step.sortOrder ?? index,
          })),
        },
      },
      select: { id: true },
    });

    return { ok: true, programId: program.id };
  } catch {
    return { ok: false, error: "Gagal membuat program vaksin." };
  }
}
