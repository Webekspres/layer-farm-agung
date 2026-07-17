import {
  applyStockMutation as defaultApplyStockMutation,
} from "@/features/inventory/services/apply-stock-mutation";
import { StockMutationType } from "@/features/inventory/lib/stock-mutation-types";
import type { ReceivePurchaseOrderInput } from "@/features/procurement/schemas/purchase-order";
import defaultPrisma from "@/lib/prisma";

export type ReceivePurchaseOrderResult =
  | { ok: true; status: "PartiallyReceived" | "Received" }
  | { ok: false; error: string };

class ReceiveError extends Error {}
class ConcurrencyError extends Error {}

/** PO statuses that may still accept a receipt. */
const OPEN_STATUSES = new Set(["Pending", "PartiallyReceived"]);
/** Tolerance for float rounding when comparing requested vs. remaining qty. */
const EPSILON = 1e-6;

export type ReceivePurchaseOrderOptions = {
  /**
   * Test-only seams. Bun's `mock.module` replaces a module for the whole
   * process (no per-file restore), which would otherwise break unrelated
   * tests importing the real `@/lib/prisma` / `apply-stock-mutation`. Inject
   * fakes here instead; production callers never set these.
   */
  deps?: {
    prisma?: typeof defaultPrisma;
    applyStockMutation?: typeof defaultApplyStockMutation;
  };
};

/**
 * Receives a Pending/PartiallyReceived PO — full or per-line partial — and
 * applies IN_PURCHASE stock mutations only for the newly received quantity.
 * Sets the PO to Received once every line is fully received, otherwise
 * PartiallyReceived. Rejects Cancelled/Received orders.
 */
export async function receivePurchaseOrder(
  tenantId: string,
  input: ReceivePurchaseOrderInput,
  options: ReceivePurchaseOrderOptions = {},
): Promise<ReceivePurchaseOrderResult> {
  const prisma = options.deps?.prisma ?? defaultPrisma;
  const applyStockMutation =
    options.deps?.applyStockMutation ?? defaultApplyStockMutation;

  const po = await prisma.purchaseOrder.findFirst({
    where: {
      id: input.poId,
      vendor: { tenant_id: tenantId },
    },
    include: {
      vendor: { select: { name: true } },
      purchase_order_items: {
        select: {
          id: true,
          item_id: true,
          quantity: true,
          quantity_received: true,
        },
      },
    },
  });

  if (!po) {
    return { ok: false, error: "Pesanan pembelian tidak ditemukan." };
  }

  if (!OPEN_STATUSES.has(po.status)) {
    return {
      ok: false,
      error: "Pesanan ini sudah diterima seluruhnya atau dibatalkan.",
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

  const requestedByItemId = input.items
    ? new Map(input.items.map((line) => [line.itemId, line.quantity]))
    : null;

  const linesToReceive: { lineId: string; itemId: string; qty: number }[] = [];

  for (const line of po.purchase_order_items) {
    const remaining = line.quantity - line.quantity_received;
    const requested = requestedByItemId
      ? requestedByItemId.get(line.item_id) ?? 0
      : remaining;

    if (requested > remaining + EPSILON) {
      return {
        ok: false,
        error: "Jumlah yang diterima melebihi sisa barang yang belum diterima.",
      };
    }

    if (requested > EPSILON) {
      linesToReceive.push({
        lineId: line.id,
        itemId: line.item_id,
        qty: requested,
      });
    }
  }

  if (linesToReceive.length === 0) {
    return {
      ok: false,
      error: "Masukkan jumlah penerimaan lebih dari 0 untuk minimal satu barang.",
    };
  }

  try {
    const status = await prisma.$transaction(async (tx) => {
      for (const line of linesToReceive) {
        const result = await applyStockMutation(tx, {
          itemId: line.itemId,
          locationId: input.locationId,
          mutationType: StockMutationType.IN_PURCHASE,
          quantity: line.qty,
          referenceId: po.id,
        });

        if (!result.ok) {
          throw new ReceiveError(result.error);
        }

        await tx.purchaseOrderItem.update({
          where: { id: line.lineId },
          data: { quantity_received: { increment: line.qty } },
        });
      }

      const updatedLines = await tx.purchaseOrderItem.findMany({
        where: { po_id: po.id },
        select: { quantity: true, quantity_received: true },
      });

      const fullyReceived = updatedLines.every(
        (l) => l.quantity_received >= l.quantity - EPSILON,
      );
      const nextStatus = fullyReceived ? "Received" : "PartiallyReceived";

      const updated = await tx.purchaseOrder.updateMany({
        where: { id: po.id, status: po.status },
        data: { status: nextStatus },
      });

      if (updated.count === 0) {
        throw new ConcurrencyError();
      }

      if (nextStatus === "Received") {
        const existingCashflow = await tx.cashflowTransaction.findFirst({
          where: {
            tenant_id: tenantId,
            type: "Expense",
            reference_id: po.id,
          },
          select: { id: true },
        });

        if (!existingCashflow) {
          await tx.cashflowTransaction.create({
            data: {
              tenant_id: tenantId,
              transaction_date: po.order_date,
              type: "Expense",
              reference_id: po.id,
              amount: po.total_amount,
              description: `Pembelian saprodi - ${po.vendor.name}`,
            },
          });
        }
      }

      return nextStatus;
    });

    return { ok: true, status: status as "PartiallyReceived" | "Received" };
  } catch (error) {
    if (error instanceof ReceiveError) {
      return { ok: false, error: error.message };
    }
    if (error instanceof ConcurrencyError) {
      return {
        ok: false,
        error: "Pesanan sudah diperbarui oleh proses lain.",
      };
    }
    return { ok: false, error: "Gagal menerima barang dari pesanan." };
  }
}
