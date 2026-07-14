import prisma from "@/lib/prisma";
import type { CancelVaccineScheduleInput } from "@/features/health/schemas/vaccine-schedule";

export type CancelVaccineScheduleResult =
  | { ok: true }
  | { ok: false; error: string };

/** Admin-only: cancel a schedule that has not been completed yet. */
export async function cancelVaccineSchedule(
  tenantId: string,
  input: CancelVaccineScheduleInput,
): Promise<CancelVaccineScheduleResult> {
  const schedule = await prisma.vaccineSchedule.findFirst({
    where: {
      id: input.scheduleId,
      cage: { location: { tenant_id: tenantId } },
    },
    select: { id: true, status: true },
  });

  if (!schedule) {
    return { ok: false, error: "Jadwal vaksinasi tidak ditemukan di tenant ini." };
  }

  if (schedule.status !== "Pending") {
    return {
      ok: false,
      error: "Hanya jadwal yang masih menunggu yang dapat dibatalkan.",
    };
  }

  const updated = await prisma.vaccineSchedule.updateMany({
    where: { id: schedule.id, status: "Pending" },
    data: { status: "Cancelled" },
  });

  if (updated.count === 0) {
    return {
      ok: false,
      error: "Jadwal vaksinasi sudah diperbarui oleh proses lain.",
    };
  }

  return { ok: true };
}
