"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NOTIFICATION_LABELS, type AppNotificationView } from "@/features/notifications/lib/notification-types";
import { markAllNotificationsReadAction, markNotificationReadAction } from "@/features/notifications/actions/notification-actions";

const POLL_INTERVAL_MS = 30_000;

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "baru saja";
  if (minutes < 60) return `${minutes} mnt`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam`;
  const days = Math.floor(hours / 24);
  return `${days} hari`;
}

export function NotificationBell() {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState<AppNotificationView[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const hasOpened = useRef(false);

  const refreshCount = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/unread-count");
      if (res.ok) {
        const data = (await res.json()) as { count: number };
        setUnreadCount(data.count);
      }
    } catch {
      // abaikan error polling
    }
  }, []);

  useEffect(() => {
    const initialTimer = setTimeout(() => void refreshCount(), 0);
    const timer = setInterval(() => void refreshCount(), POLL_INTERVAL_MS);
    return () => {
      clearTimeout(initialTimer);
      clearInterval(timer);
    };
  }, [refreshCount]);

  const loadList = useCallback(async (cursor?: string) => {
    const url = `/api/notifications/list${cursor ? `?cursor=${cursor}` : ""}`;
    const res = await fetch(url);
    if (!res.ok) return;
    const data = (await res.json()) as {
      items: AppNotificationView[];
      nextCursor: string | null;
      hasMore: boolean;
      unreadCount: number;
    };
    setItems((prev) => (cursor ? [...prev, ...data.items] : data.items));
    setNextCursor(data.nextCursor);
    setHasMore(data.hasMore);
    setUnreadCount(data.unreadCount);
  }, []);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next && !hasOpened.current) {
      hasOpened.current = true;
      setLoading(true);
      void loadList().finally(() => setLoading(false));
    }
  }

  async function handleMarkRead(notification: AppNotificationView) {
    if (notification.isRead) {
      handleOpen(notification);
      return;
    }
    await markNotificationReadAction(notification.id);
    setItems((prev) =>
      prev.map((item) =>
        item.id === notification.id ? { ...item, isRead: true } : item,
      ),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    handleOpen(notification);
  }

  async function handleMarkAllRead() {
    await markAllNotificationsReadAction();
    setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);
  }

  function handleOpen(notification: AppNotificationView) {
    const cageId = notification.data?.cageId;
    if (cageId) {
      setOpen(false);
      router.push(`/dashboard/cages/${cageId}`);
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifikasi"
        >
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground tabular-nums">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 sm:w-96">
        <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
          <p className="text-sm font-medium">Notifikasi</p>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs text-muted-foreground"
              onClick={() => void handleMarkAllRead()}
            >
              <CheckCheck className="size-3.5" />
              Tandai semua dibaca
            </Button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {loading && items.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Memuat notifikasi…
            </div>
          ) : items.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Tidak ada notifikasi.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => void handleMarkRead(item)}
                    className={`flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-muted/50 ${
                      item.isRead ? "opacity-70" : ""
                    }`}
                  >
                    <span
                      className={`mt-1.5 size-2 shrink-0 rounded-full ${
                        item.isRead
                          ? "bg-transparent"
                          : item.critical
                            ? "bg-destructive"
                            : "bg-primary"
                      }`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-xs font-medium">
                          {NOTIFICATION_LABELS[item.type] ?? item.type}
                        </span>
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          {formatRelative(item.createdAt)}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-sm text-foreground">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {item.body}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border px-3 py-2">
          {hasMore ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => void loadList(nextCursor ?? undefined)}
            >
              Muat lainnya
            </Button>
          ) : (
            <span className="text-[11px] text-muted-foreground">
              {items.length > 0
                ? `${items.length} notifikasi`
                : ""}
            </span>
          )}
          <Badge
            variant="secondary"
            className="font-normal"
          >
            {unreadCount} belum dibaca
          </Badge>
        </div>
      </PopoverContent>
    </Popover>
  );
}