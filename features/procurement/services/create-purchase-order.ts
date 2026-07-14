import type { CreatePurchaseOrderInput } from "@/features/procurement/schemas/purchase-order";
import { normalizeBusinessDate } from "@/lib/business-date";
import prisma from "@/lib/prisma";

export type CreatePurchaseOrderResult =
  | { ok: true; poId: string }
  | { ok: false; error: string };

export async function createPurchaseOrder(
  tenantId: string,
  input: CreatePurchaseOrderInput,
): Promise<CreatePurchaseOrderResult> {
  const vendor = await prisma.vendor.findFirst({
    where: { id: input.vendorId, tenant_id: tenantId },
    select: { id: true },
  });

  if (!vendor) {
    return { ok: false, error: "Vendor tidak ditemukan di tenant ini." };
  }

  const itemIds = [...new Set(input.items.map((i) => i.itemId))];
  const items = await prisma.item.findMany({
    where: { id: { in: itemIds }, tenant_id: tenantId },
    select: { id: true },
  });

  if (items.length !== itemIds.length) {
    return {
      ok: false,
      error: "Satu atau lebih item tidak ditemukan di inventori tenant.",
    };
  }

  const totalAmount = input.items.reduce(
    (sum, line) => sum + line.quantity * line.unitPrice,
    0,
  );

  const orderDate = normalizeBusinessDate(input.orderDate);

  try {
    const po = await prisma.$transaction(async (tx) => {
      return tx.purchaseOrder.create({
        data: {
          vendor_id: input.vendorId,
          order_date: orderDate,
          status: "Pending",
          total_amount: totalAmount,
          purchase_order_items: {
            create: input.items.map((line) => ({
              item_id: line.itemId,
              quantity: line.quantity,
              unit_price: line.unitPrice,
            })),
          },
        },
        select: { id: true },
      });
    });

    return { ok: true, poId: po.id };
  } catch {
    return { ok: false, error: "Gagal membuat pesanan pembelian." };
  }
}
