import prisma from "@/lib/prisma";
import { formatBusinessDateFromDb } from "@/lib/business-date";
import type {
  PurchaseOrderListItem,
  PurchaseOrderStatus,
} from "@/features/procurement/types";
import type { PaginationMeta } from "@/lib/pagination";

export type PaginatedPurchaseOrdersResult = {
  items: PurchaseOrderListItem[];
} & PaginationMeta;

export async function listPurchaseOrders(
  tenantId: string,
  options: { page?: number; pageSize?: number } = {},
): Promise<PaginatedPurchaseOrdersResult> {
  const { page, pageSize } = options;
  const where = { vendor: { tenant_id: tenantId } };

  const include = {
    vendor: { select: { name: true } },
    _count: { select: { purchase_order_items: true } },
  } as const;

  if (page !== undefined && pageSize !== undefined) {
    const total = await prisma.purchaseOrder.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const skip = (safePage - 1) * pageSize;

    const rows = await prisma.purchaseOrder.findMany({
      where,
      include,
      orderBy: { order_date: "desc" },
      skip,
      take: pageSize,
    });

    return {
      items: rows.map(mapRow),
      total,
      page: safePage,
      pageSize,
      totalPages,
    };
  }

  const rows = await prisma.purchaseOrder.findMany({
    where,
    include,
    orderBy: { order_date: "desc" },
  });
  const mapped = rows.map(mapRow);

  return {
    items: mapped,
    total: mapped.length,
    page: 1,
    pageSize: mapped.length || 10,
    totalPages: 1,
  };
}

function mapRow(row: {
  id: string;
  order_date: Date;
  status: string;
  total_amount: { toNumber(): number } | number;
  created_at: Date;
  vendor: { name: string };
  _count: { purchase_order_items: number };
}): PurchaseOrderListItem {
  const totalAmount =
    typeof row.total_amount === "number"
      ? row.total_amount
      : row.total_amount.toNumber();

  return {
    id: row.id,
    vendorName: row.vendor.name,
    orderDate: formatBusinessDateFromDb(row.order_date),
    status: row.status as PurchaseOrderStatus,
    totalAmount,
    itemCount: row._count.purchase_order_items,
    createdAt: row.created_at.toISOString(),
  };
}
