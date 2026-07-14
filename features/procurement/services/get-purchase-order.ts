import type { PurchaseOrderDetail } from "@/features/procurement/types";
import { formatBusinessDateFromDb } from "@/lib/business-date";
import prisma from "@/lib/prisma";
import { isUuid } from "@/lib/uuid";

export async function getPurchaseOrder(
  tenantId: string,
  poId: string,
): Promise<PurchaseOrderDetail | null> {
  if (!isUuid(poId)) return null;

  const row = await prisma.purchaseOrder.findFirst({
    where: {
      id: poId,
      vendor: { tenant_id: tenantId },
    },
    include: {
      vendor: { select: { id: true, name: true } },
      purchase_order_items: {
        include: {
          item: { select: { name: true, unit: true } },
        },
      },
    },
  });

  if (!row) return null;

  const totalAmount =
    typeof row.total_amount === "number"
      ? row.total_amount
      : row.total_amount.toNumber();

  return {
    id: row.id,
    vendorId: row.vendor.id,
    vendorName: row.vendor.name,
    orderDate: formatBusinessDateFromDb(row.order_date),
    status: row.status as PurchaseOrderDetail["status"],
    totalAmount,
    createdAt: row.created_at.toISOString(),
    items: row.purchase_order_items.map((line) => {
      const unitPrice =
        typeof line.unit_price === "number"
          ? line.unit_price
          : line.unit_price.toNumber();

      return {
        id: line.id,
        itemId: line.item_id,
        itemName: line.item.name,
        itemUnit: line.item.unit,
        quantity: line.quantity,
        unitPrice,
        lineTotal: line.quantity * unitPrice,
      };
    }),
  };
}
