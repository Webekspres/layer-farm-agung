import prisma from "@/lib/prisma";
import { formatBusinessDate, startOfTodayBusiness } from "@/lib/business-date";
import { createAppNotification } from "@/features/notifications/services/create-app-notification";
import { listCageStaffUsers } from "@/features/notifications/services/notification-receivers";

/**
 * Generator reminder input harian: staff yang ditugaskan ke kandang aktif
 * yang belum melaporkan produksi hari ini.
 */
export async function notifyUnreportedInput() {
  const today = startOfTodayBusiness();
  const dateKey = formatBusinessDate(today);

  const cages = await prisma.cage.findMany({
    where: {
      status: "Active",
      cycle_settings: {
        some: {
          status: "Active",
          OR: [{ end_date: null }, { end_date: { gte: today } }],
        },
      },
    },
    select: {
      id: true,
      name: true,
      location: { select: { tenant_id: true } },
    },
  });

  let created = 0;

  for (const cage of cages) {
    const reported = await prisma.dailyProduction.findFirst({
      where: { cage_id: cage.id, record_date: today },
      select: { id: true },
    });

    if (reported) {
      continue;
    }

    const staff = await listCageStaffUsers(cage.id);
    if (staff.length === 0) {
      continue;
    }

    for (const member of staff) {
      await createAppNotification({
        tenantId: cage.location.tenant_id,
        userId: member.id,
        type: "INPUT_REMINDER",
        title: "Input harian belum dilaporkan",
        body: `${cage.name}: produksi ${dateKey} belum dilaporkan.`,
        data: {
          cageId: cage.id,
          cageName: cage.name,
          referenceDate: dateKey,
          critical: false,
        },
        dedupeKey: `input:${cage.id}:${dateKey}:${member.id}`,
      });
      created++;
    }
  }

  return { created, checked: cages.length };
}