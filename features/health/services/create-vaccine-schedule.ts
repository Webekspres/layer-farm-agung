import prisma from "@/lib/prisma";
import { ItemType } from "@/generated/prisma/enums";
import type { CreateVaccineScheduleInput } from "@/features/health/schemas/vaccine-schedule";

export type CreateVaccineScheduleResult =
  | { ok: true; scheduleId: string }
  | { ok: false; error: string };

export async function createVaccineSchedule(
  tenantId: string,
  input: CreateVaccineScheduleInput,
): Promise<CreateVaccineScheduleResult> {
  const cage = await prisma.cage.findFirst({
    where: { id: input.cageId, location: { tenant_id: tenantId } },
    select: { id: true },
  });

  if (!cage) {
    return { ok: false, error: "Kandang tidak ditemukan di tenant ini." };
  }

  const item = await prisma.item.findFirst({
    where: { id: input.itemId, tenant_id: tenantId, type: ItemType.Vaccine },
    select: { id: true },
  });

  if (!item) {
    return { ok: false, error: "Item vaksin tidak ditemukan di tenant ini." };
  }

  try {
    const schedule = await prisma.vaccineSchedule.create({
      data: {
        cage_id: input.cageId,
        item_id: input.itemId,
        scheduled_date: input.scheduledDate,
        notes: input.notes ?? null,
      },
      select: { id: true },
    });

    return { ok: true, scheduleId: schedule.id };
  } catch {
    return { ok: false, error: "Gagal membuat jadwal vaksinasi." };
  }
}
