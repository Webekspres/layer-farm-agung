import prisma from "@/lib/prisma";
import { ItemType } from "@/generated/prisma/enums";
import { shiftBusinessDate } from "@/lib/business-date";

export const VACCINE_SCHEDULE_SOURCE = {
  Manual: "Manual",
  Program: "Program",
} as const;

export type GenerateVaccineSchedulesResult =
  | {
      ok: true;
      created: number;
      skipped: number;
      programId: string | null;
      programName: string | null;
      info?: string;
    }
  | { ok: false; error: string };

type GenerateDeps = {
  prisma: typeof prisma;
};

const ALLOWED_ITEM_TYPES: ItemType[] = [ItemType.Vaccine, ItemType.Vitamin];

/**
 * Resolve active program for a cage: prefer strain-matched, else tenant default
 * (`strain_id = null`).
 */
export async function resolveVaccineProgramForCage(
  tenantId: string,
  cageId: string,
  deps: GenerateDeps = { prisma },
) {
  const cage = await deps.prisma.cage.findFirst({
    where: { id: cageId, location: { tenant_id: tenantId } },
    select: { id: true, strain_id: true },
  });

  if (!cage) {
    return { ok: false as const, error: "Kandang tidak ditemukan di tenant ini." };
  }

  const strainProgram = await deps.prisma.vaccineProgram.findFirst({
    where: {
      tenant_id: tenantId,
      is_active: true,
      strain_id: cage.strain_id,
    },
    include: {
      steps: {
        orderBy: [{ age_days: "asc" }, { sort_order: "asc" }],
        include: { item: { select: { id: true, type: true, tenant_id: true } } },
      },
    },
  });

  if (strainProgram) {
    return { ok: true as const, cage, program: strainProgram };
  }

  const defaultProgram = await deps.prisma.vaccineProgram.findFirst({
    where: {
      tenant_id: tenantId,
      is_active: true,
      strain_id: null,
    },
    include: {
      steps: {
        orderBy: [{ age_days: "asc" }, { sort_order: "asc" }],
        include: { item: { select: { id: true, type: true, tenant_id: true } } },
      },
    },
  });

  if (!defaultProgram) {
    return {
      ok: true as const,
      cage,
      program: null,
    };
  }

  return { ok: true as const, cage, program: defaultProgram };
}

/**
 * Generate Pending `VaccineSchedule` rows from the resolved program.
 * Idempotent: skips when a Pending schedule already exists for the same
 * `program_step_id` on this cage.
 */
export async function generateVaccineSchedulesForCycle(
  tenantId: string,
  cageId: string,
  cycleStartDate: Date,
  deps: GenerateDeps = { prisma },
): Promise<GenerateVaccineSchedulesResult> {
  const resolved = await resolveVaccineProgramForCage(tenantId, cageId, deps);

  if (!resolved.ok) {
    return { ok: false, error: resolved.error };
  }

  if (!resolved.program) {
    return {
      ok: true,
      created: 0,
      skipped: 0,
      programId: null,
      programName: null,
      info: "Tidak ada program vaksin aktif untuk tenant/strain ini.",
    };
  }

  const { program } = resolved;

  if (program.steps.length === 0) {
    return {
      ok: true,
      created: 0,
      skipped: 0,
      programId: program.id,
      programName: program.name,
      info: "Program vaksin aktif tidak memiliki langkah.",
    };
  }

  for (const step of program.steps) {
    if (step.item.tenant_id !== tenantId) {
      return {
        ok: false,
        error: "Item langkah program tidak berada di tenant yang sama.",
      };
    }
    if (!ALLOWED_ITEM_TYPES.includes(step.item.type as ItemType)) {
      return {
        ok: false,
        error: `Item langkah program harus bertipe Vaccine atau Vitamin (langkah umur ${step.age_days} hari).`,
      };
    }
  }

  const stepIds = program.steps.map((s) => s.id);
  const existingPending = await deps.prisma.vaccineSchedule.findMany({
    where: {
      cage_id: cageId,
      status: "Pending",
      source: VACCINE_SCHEDULE_SOURCE.Program,
      program_step_id: { in: stepIds },
    },
    select: { program_step_id: true },
  });

  const existingStepIds = new Set(
    existingPending
      .map((row) => row.program_step_id)
      .filter((id): id is string => Boolean(id)),
  );

  let created = 0;
  let skipped = 0;
  const toCreate = [];

  for (const step of program.steps) {
    if (existingStepIds.has(step.id)) {
      skipped += 1;
      continue;
    }

    const noteParts = [
      step.pathogen_label ? `Patogen: ${step.pathogen_label}` : null,
      step.formulation_type ? `Formulasi: ${step.formulation_type}` : null,
      step.notes ?? null,
      `Program: ${program.name} (hari ke-${step.age_days})`,
    ].filter(Boolean);

    toCreate.push({
      cage_id: cageId,
      item_id: step.item_id,
      scheduled_date: shiftBusinessDate(cycleStartDate, step.age_days),
      status: "Pending",
      notes: noteParts.join(" · ") || null,
      source: VACCINE_SCHEDULE_SOURCE.Program,
      program_step_id: step.id,
    });
    created += 1;
  }

  if (toCreate.length > 0) {
    await deps.prisma.vaccineSchedule.createMany({ data: toCreate });
  }

  return {
    ok: true,
    created,
    skipped,
    programId: program.id,
    programName: program.name,
  };
}
