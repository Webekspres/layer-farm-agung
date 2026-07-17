import type { VaccineScheduleStatus } from "@/features/health/types";

export const VACCINE_STATUS_LABELS: Record<VaccineScheduleStatus, string> = {
  Pending: "Menunggu",
  Completed: "Selesai",
  Cancelled: "Dibatalkan",
};

export function vaccineStatusLabel(status: string): string {
  return VACCINE_STATUS_LABELS[status as VaccineScheduleStatus] ?? status;
}

export function vaccineStatusBadgeVariant(
  status: string,
): "outline" | "secondary" | "destructive" {
  if (status === "Completed") return "secondary";
  if (status === "Cancelled") return "destructive";
  return "outline";
}
