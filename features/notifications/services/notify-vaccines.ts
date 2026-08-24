import prisma from "@/lib/prisma";
import { formatBusinessDate, shiftBusinessDate, startOfTodayBusiness } from "@/lib/business-date";
import { createAppNotification } from "@/features/notifications/services/create-app-notification";
import { listCageStaffUsers, listTenantAdminUsers } from "@/features/notifications/services/notification-receivers";

/**
 * Generator vaksin: peringatan jadwal vaksin (hari ini s.d. +2 hari)
 * dan vaksin terlambat untuk staff kandang + admin tenant.
 */
export async function notifyVaccineSchedules() {
  const today = startOfTodayBusiness();
  const windowEnd = shiftBusinessDate(today, 2);

  const schedules = await prisma.vaccineSchedule.findMany({
    where: {
      status: "Pending",
      scheduled_date: { lte: windowEnd },
    },
    include: {
      cage: {
        select: {
          id: true,
          name: true,
          location: { select: { tenant_id: true } },
        },
      },
      item: { select: { name: true } },
    },
  });

  const byTenant = new Map<string, typeof schedules>();
  for (const schedule of schedules) {
    const tenantId = schedule.cage.location.tenant_id;
    const bucket = byTenant.get(tenantId) ?? [];
    bucket.push(schedule);
    byTenant.set(tenantId, bucket);
  }

  let created = 0;
  for (const [tenantId, tenantSchedules] of byTenant) {
    const admins = await listTenantAdminUsers(tenantId);
    const adminIds = admins.map((admin) => admin.id);

    for (const schedule of tenantSchedules) {
      const isOverdue = schedule.scheduled_date.getTime() < today.getTime();
      const referenceDate = formatBusinessDate(schedule.scheduled_date);

      const cageStaff = await listCageStaffUsers(schedule.cage.id);
      const staffIds = cageStaff.map((staff) => staff.id);
      const receiverIds = [...new Set([...staffIds, ...adminIds])];

      const type = isOverdue ? "VACCINE_OVERDUE" : "VACCINE_SCHEDULED";
      const title = isOverdue
        ? "Vaksin terlambat"
        : "Jadwal vaksin hari ini";
      const body = isOverdue
        ? `${schedule.cage.name}: vaksin ${schedule.item.name} terjadwal ${referenceDate} belum dikerjakan.`
        : `${schedule.cage.name}: vaksin ${schedule.item.name} dijadwalkan hari ini (${referenceDate}).`;

      for (const userId of receiverIds) {
        await createAppNotification({
          tenantId,
          userId,
          type,
          title,
          body,
          data: {
            cageId: schedule.cage.id,
            cageName: schedule.cage.name,
            itemName: schedule.item.name,
            referenceDate,
            critical: isOverdue,
          },
          dedupeKey: `vaccine:${schedule.id}:${userId}`,
        });
        created++;
      }
    }
  }

  return { created };
}