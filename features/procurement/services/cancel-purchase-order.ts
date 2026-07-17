import type { CancelPurchaseOrderInput } from "@/features/procurement/schemas/purchase-order";
import defaultPrisma from "@/lib/prisma";

export type CancelPurchaseOrderResult =
  | { ok: true }
  | { ok: false; error: string };

export type CancelPurchaseOrderOptions = {
  deps?: {
    prisma?: typeof defaultPrisma;
  };
};

/** Only a Pending PO with zero received quantity on every line may be cancelled. */
export async function cancelPurchaseOrder(
  tenantId: string,
  input: CancelPurchaseOrderInput,
  options: CancelPurchaseOrderOptions = {},
): Promise<CancelPurchaseOrderResult> {
  const prisma = options.deps?.prisma ?? defaultPrisma;

  const po = await prisma.purchaseOrder.findFirst({
    where: {
      id: input.poId,
      vendor: { tenant_id: tenantId },
    },
    include: {
      purchase_order_items: { select: { quantity_received: true } },
    },
  });

  if (!po) {
    return { ok: false, error: "Pesanan pembelian tidak ditemukan." };
  }

  if (po.status !== "Pending") {
    return {
      ok: false,
      error: "Hanya pesanan yang belum ada penerimaan barang yang dapat dibatalkan.",
    };
  }

  const hasReceivedQuantity = po.purchase_order_items.some(
    (line) => line.quantity_received > 0,
  );

  if (hasReceivedQuantity) {
    return {
      ok: false,
      error: "Hanya pesanan yang belum ada penerimaan barang yang dapat dibatalkan.",
    };
  }

  const updated = await prisma.purchaseOrder.updateMany({
    where: { id: po.id, status: "Pending" },
    data: { status: "Cancelled" },
  });

  if (updated.count === 0) {
    return { ok: false, error: "Pesanan sudah diperbarui oleh proses lain." };
  }

  return { ok: true };
}
