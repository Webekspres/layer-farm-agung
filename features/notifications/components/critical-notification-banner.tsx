import { TriangleAlert } from "lucide-react";
import prisma from "@/lib/prisma";
import { CRITICAL_NOTIFICATION_TYPES, NOTIFICATION_LABELS } from "@/features/notifications/lib/notification-types";
import { markCriticalNotificationsReadAction } from "@/features/notifications/actions/notification-actions";

/**
 * Banner peringatan di dashboard untuk notifikasi kritis yang belum dibaca
 * (vaksin terlambat, stok rendah). Muncul hanya bila ada, tersembunyi saat 0.
 */
export async function CriticalNotificationBanner({ userId }: { userId: string }) {
  const critical = await prisma.appNotification.findMany({
    where: {
      user_id: userId,
      is_read: false,
      type: { in: CRITICAL_NOTIFICATION_TYPES },
    },
    orderBy: { created_at: "desc" },
    take: 3,
    select: { id: true, type: true, title: true, body: true },
  });

  if (critical.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3">
        <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-destructive">
            {critical.length} peringatan perlu perhatian
          </p>
          <ul className="mt-1 space-y-1">
            {critical.map((item) => (
              <li key={item.id} className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                  {NOTIFICATION_LABELS[item.type as keyof typeof NOTIFICATION_LABELS] ??
                    item.type}
                </span>
                {" — "}
                {item.body}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <form
        action={markCriticalNotificationsReadAction}
        className="shrink-0"
      >
        <button
          type="submit"
          className="rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
        >
          Tandai dibaca
        </button>
      </form>
    </div>
  );
}