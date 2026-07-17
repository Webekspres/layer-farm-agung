import type { PurchaseOrderStatus } from "@/features/procurement/types";

export const PURCHASE_ORDER_STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  Pending: "Menunggu penerimaan",
  PartiallyReceived: "Diterima sebagian",
  Received: "Diterima",
  Cancelled: "Dibatalkan",
};

export function purchaseOrderStatusLabel(status: string): string {
  return PURCHASE_ORDER_STATUS_LABELS[status as PurchaseOrderStatus] ?? status;
}

export function purchaseOrderStatusBadgeVariant(
  status: string,
): "outline" | "secondary" | "destructive" {
  if (status === "Received") return "secondary";
  if (status === "Cancelled") return "destructive";
  return "outline";
}
