import { applyStockMutation } from "@/features/inventory/services/apply-stock-mutation";
import { StockMutationType } from "@/features/inventory/lib/stock-mutation-types";
import type { ReceivePurchaseOrderInput } from "@/features/procurement/schemas/purchase-order";
import prisma from "@/lib/prisma";

export type ReceivePurchaseOrderResult =
  | { ok: true }
  | { ok: false; error: string };

class ReceiveError extends Error {}

/**
 * Marks a Pending PO as Received and applies IN_PURCHASE stock mutations
 * for every line item at the given tenant location.
 */
export async function receivePurchaseOrder(
  tenantId: string,
  input: ReceivePurchaseOrderInput,
): Promise<ReceivePurchaseOrderResult> {
  const po = await prisma.purchaseOrder.findFirst({
    where: {
      id: input.poId,
      vendor: { tenant_id: tenantId },
    },
    include: {
      purchase_order_items: {
        select: { item_id: true, quantity: true },
      },
    },
  });

  if (!po) {
    return { ok: false, error: "Pesanan pembelian tidak ditemukan." };
  }

  if (po.status !== "Pending") {
    return {
      ok: false,
      error: "Pesanan ini sudah diterima atau tidak dapat diproses.",
    };
  }

  const location = await prisma.location.findFirst({
    where: { id: input.locationId, tenant_id: tenantId },
    select: { id: true },
  });

  if (!location) {
    return { ok: false, error: "Lokasi tidak ditemukan di tenant ini." };
  }

  if (po.purchase_order_items.length === 0) {
    return { ok: false, error: "Pesanan tidak memiliki barang." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      for (const line of po.purchase_order_items) {
        const result = await applyStockMutation(tx, {
          itemId: line.item_id,
          locationId: input.locationId,
          mutationType: StockMutationType.IN_PURCHASE,
          quantity: line.quantity,
          referenceId: po.id,
        });

        if (!result.ok) {
          throw new ReceiveError(result.error);
        }
      }

      await tx.purchaseOrder.update({
        where: { id: po.id },
        data: { status: "Received" },
      });
    });
  } catch (error) {
    if (error instanceof ReceiveError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "Gagal menerima barang dari pesanan." };
  }

  return { ok: true };
}
