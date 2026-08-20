/**
 * Cron job notifikasi: jalankan semua generator (vaksin, input harian,
 * stok rendah, ringkasan harian) lalu kirim push ke perangkat mobile.
 *
 * Idempoten (pakai `dedupeKey`), aman dijalankan berkali-kali sehari.
 *
 * Run:  bun scripts/notification-jobs.ts
 * Cron: 30 6 * * * cd /path/layer-farm-agung && DATABASE_URL=... bun scripts/notification-jobs.ts >> /var/log/aapm-notifications.log 2>&1
 */
import { runNotificationJobs } from "@/features/notifications/services/run-notification-jobs";

async function main() {
  const result = await runNotificationJobs();
  console.log(
    `[${new Date().toISOString()}] notification jobs done: vaccines=${result.vaccines} unreported=${result.unreported} lowStock=${result.lowStock} summary=${result.summary}`,
  );
  await import("@/lib/prisma").then(({ default: prisma }) => prisma.$disconnect());
}

main().catch((error) => {
  console.error("[notification-jobs] failed:", error);
  process.exit(1);
});