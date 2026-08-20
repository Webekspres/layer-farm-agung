export const NOTIFICATION_TYPES = {
  VACCINE_SCHEDULED: "VACCINE_SCHEDULED",
  VACCINE_OVERDUE: "VACCINE_OVERDUE",
  INPUT_REMINDER: "INPUT_REMINDER",
  LOW_STOCK: "LOW_STOCK",
  DAILY_SUMMARY: "DAILY_SUMMARY",
} as const;

export type NotificationType = keyof typeof NOTIFICATION_TYPES;

/** Data payload — disimpan di kolom `data` (JSON). */
export type NotificationData = {
  cageId?: string;
  cageName?: string;
  itemId?: string;
  itemName?: string;
  eggGradeId?: number;
  locationId?: string;
  referenceDate?: string;
  critical?: boolean;
  [key: string]: unknown;
};

export const NOTIFICATION_LABELS: Record<NotificationType, string> = {
  VACCINE_SCHEDULED: "Jadwal vaksin",
  VACCINE_OVERDUE: "Vaksin terlambat",
  INPUT_REMINDER: "Input harian",
  LOW_STOCK: "Stok rendah",
  DAILY_SUMMARY: "Ringkasan harian",
};

/** Daftar tipe yang dianggap kritis (banner + tone warning di bell). */
export const CRITICAL_NOTIFICATION_TYPES: NotificationType[] = [
  "VACCINE_OVERDUE",
  "LOW_STOCK",
];

export type AppNotificationView = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: NotificationData | null;
  isRead: boolean;
  createdAt: string;
  critical: boolean;
};