import { notifyVaccineSchedules } from "@/features/notifications/services/notify-vaccines";
import { notifyUnreportedInput } from "@/features/notifications/services/notify-unreported-input";
import { notifyLowStock } from "@/features/notifications/services/notify-low-stock";
import { notifyDailySummary } from "@/features/notifications/services/notify-daily-summary";

/**
 * Jalankan semua generator notifikasi (dipanggil via cron/script).
 * Aman dijalankan ulang berulang kali berkat `dedupeKey`.
 */
export async function runNotificationJobs() {
  const [vaccines, unreported, lowStock, summary] = await Promise.all([
    notifyVaccineSchedules(),
    notifyUnreportedInput(),
    notifyLowStock(),
    notifyDailySummary(),
  ]);

  return {
    vaccines: vaccines.created,
    unreported: unreported.created,
    lowStock: lowStock.created,
    summary: summary.created,
  };
}