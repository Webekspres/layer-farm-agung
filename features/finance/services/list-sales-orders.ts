import prisma from "@/lib/prisma";
import { formatBusinessDateFromDb } from "@/lib/business-date";
import type { SalesOrderListItem } from "@/features/finance/types";
import type { PaginationMeta } from "@/lib/pagination";

export type PaginatedSalesOrdersResult = {
  items: SalesOrderListItem[];
} & PaginationMeta;

function mapRow(row: {
  id: string;
  customer_id: string;
  sale_date: Date;
  status: string;
  total_amount: { toNumber(): number } | number;
  created_at: Date;
  customer: { name: string };
  delivery_logs: {
    status: string;
    quantity: number;
    weight: number | null;
  }[];
  _count: { sales_order_items: number };
}): SalesOrderListItem {
  const totalAmount =
    typeof row.total_amount === "number"
      ? row.total_amount
      : row.total_amount.toNumber();

  return {
    id: row.id,
    customerId: row.customer_id,
    customerName: row.customer.name,
    saleDate: formatBusinessDateFromDb(row.sale_date),
    status: row.status,
    totalAmount,
    itemCount: row._count.sales_order_items,
    deliveryStatus: row.delivery_logs[0]?.status ?? null,
    deliveredQuantity: row.delivery_logs[0]?.quantity ?? null,
    deliveredWeight: row.delivery_logs[0]?.weight ?? null,
    createdAt: row.created_at.toISOString(),
  };
}

export async function listSalesOrders(
  tenantId: string,
  options: { page?: number; pageSize?: number } = {},
): Promise<PaginatedSalesOrdersResult> {
  const { page, pageSize } = options;
  const where = { tenant_id: tenantId };
  const include = {
    customer: { select: { name: true } },
    delivery_logs: {
      select: { status: true, quantity: true, weight: true },
      orderBy: { created_at: "desc" },
      take: 1,
    },
    _count: { select: { sales_order_items: true } },
  } as const;

  if (page !== undefined && pageSize !== undefined) {
    const total = await prisma.salesOrder.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const skip = (safePage - 1) * pageSize;

    const rows = await prisma.salesOrder.findMany({
      where,
      include,
      orderBy: { sale_date: "desc" },
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

  const rows = await prisma.salesOrder.findMany({
    where,
    include,
    orderBy: { sale_date: "desc" },
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
