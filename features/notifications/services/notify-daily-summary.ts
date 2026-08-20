import prisma from "@/lib/prisma";
import { formatBusinessDate, startOfTodayBusiness } from "@/lib/business-date";
import { createAppNotification } from "@/features/notifications/services/create-app-notification";
import { listTenantAdminUsers } from "@/features/notifications/services/notification-receivers";

/**
 * Generator ringkasan harian: rekap produksi/HDP/pakan per tenant
 * ke admin tenant.
 */
export async function notifyDailySummary() {
  const today = startOfTodayBusiness();
  const dateKey = formatBusinessDate(today);

  const tenants = await prisma.tenant.findMany({
    where: { is_active: true },
    select: { id: true, name: true },
  });

  let created = 0;

  for (const tenant of tenants) {
    const [todayAgg, feedAgg, reportedGroups, activeCages, populationAgg] =
      await Promise.all([
        prisma.dailyProduction.aggregate({
          where: { tenant_id: tenant.id, record_date: today },
          _sum: { tb: true, tr: true, tp: true },
        }),
        prisma.feedConsumption.aggregate({
          where: { tenant_id: tenant.id, record_date: today },
          _sum: { quantity: true },
        }),
        prisma.dailyProduction.groupBy({
          by: ["cage_id"],
          where: { tenant_id: tenant.id, record_date: today },
        }),
        prisma.cage.count({
          where: {
            location: { tenant_id: tenant.id },
            status: "Active",
            cycle_settings: {
              some: {
                status: "Active",
                OR: [{ end_date: null }, { end_date: { gte: today } }],
              },
            },
          },
        }),
        prisma.cycleSetting.aggregate({
          where: {
            status: "Active",
            cage: { location: { tenant_id: tenant.id } },
            OR: [{ end_date: null }, { end_date: { gte: today } }],
          },
          _sum: { initial_population: true },
        }),
      ]);

    const totalEggs =
      (todayAgg._sum.tb ?? 0) +
      (todayAgg._sum.tr ?? 0) +
      (todayAgg._sum.tp ?? 0);
    const feedKg = feedAgg._sum.quantity ?? 0;
    const reportedCount = reportedGroups.length;
    const population = populationAgg._sum.initial_population ?? 0;
    const hdp = population > 0 ? (totalEggs / population) * 100 : null;

    const hdpText = hdp === null ? "—" : `${hdp.toFixed(1)}%`;
    const body = `Total ${totalEggs.toLocaleString("id-ID")} telur (HDP ${hdpText}) dari ${reportedCount}/${activeCages} kandang · Pakan ${feedKg.toLocaleString("id-ID")} kg.`;

    const admins = await listTenantAdminUsers(tenant.id);

    for (const admin of admins) {
      await createAppNotification({
        tenantId: tenant.id,
        userId: admin.id,
        type: "DAILY_SUMMARY",
        title: `Ringkasan harian ${dateKey}`,
        body,
        data: {
          referenceDate: dateKey,
          totalEggs,
          feedKg,
          reportedCages: reportedCount,
          activeCages,
          critical: false,
        },
        dedupeKey: `summary:${dateKey}:${admin.id}`,
      });
      created++;
    }
  }

  return { created };
}