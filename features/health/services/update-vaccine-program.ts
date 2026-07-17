import prisma from "@/lib/prisma";
import { ItemType } from "@/generated/prisma/enums";
import type { UpdateVaccineProgramInput } from "@/features/health/schemas/vaccine-program";

export type UpdateVaccineProgramResult =
  | { ok: true }
  | { ok: false; error: string };

export async function updateVaccineProgram(
  tenantId: string,
  input: UpdateVaccineProgramInput,
): Promise<UpdateVaccineProgramResult> {
  const existing = await prisma.vaccineProgram.findFirst({
    where: { id: input.programId, tenant_id: tenantId },
    include: { steps: { select: { id: true } } },
  });

  if (!existing) {
    return { ok: false, error: "Program vaksin tidak ditemukan." };
  }

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

  const existingStepIds = new Set(existing.steps.map((s) => s.id));
  const keptStepIds = input.steps
    .map((s) => s.id)
    .filter(
      (id): id is string =>
        typeof id === "string" && existingStepIds.has(id),
    );
  const removeIds = existing.steps
    .map((s) => s.id)
    .filter((id) => !keptStepIds.includes(id));

  try {
    await prisma.$transaction(async (tx) => {
      if (removeIds.length > 0) {
        await tx.vaccineProgramStep.deleteMany({
          where: { id: { in: removeIds }, program_id: input.programId },
        });
      }

      await tx.vaccineProgram.update({
        where: { id: input.programId },
        data: {
          name: input.name,
          strain_id: input.strainId,
          is_active: input.isActive,
        },
      });

      for (const [index, step] of input.steps.entries()) {
        const sortOrder = step.sortOrder ?? index;
        if (step.id && existingStepIds.has(step.id)) {
          await tx.vaccineProgramStep.update({
            where: { id: step.id },
            data: {
              age_days: step.ageDays,
              item_id: step.itemId,
              pathogen_label: step.pathogenLabel ?? null,
              formulation_type: step.formulationType ?? null,
              notes: step.notes ?? null,
              sort_order: sortOrder,
            },
          });
        } else {
          await tx.vaccineProgramStep.create({
            data: {
              program_id: input.programId,
              age_days: step.ageDays,
              item_id: step.itemId,
              pathogen_label: step.pathogenLabel ?? null,
              formulation_type: step.formulationType ?? null,
              notes: step.notes ?? null,
              sort_order: sortOrder,
            },
          });
        }
      }
    });

    return { ok: true };
  } catch {
    return { ok: false, error: "Gagal memperbarui program vaksin." };
  }
}
