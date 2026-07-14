import type { CreateSalesOrderInput } from "@/features/finance/schemas/sales-order";
import { computeSalesOrderTotal } from "@/features/finance/lib/compute-sales-total";
import { normalizeBusinessDate } from "@/lib/business-date";
import prisma from "@/lib/prisma";

export type CreateSalesOrderResult =
  | { ok: true; saleId: string }
  | { ok: false; error: string };

export async function createSalesOrder(
  tenantId: string,
  input: CreateSalesOrderInput,
): Promise<CreateSalesOrderResult> {
  const customer = await prisma.customer.findFirst({
    where: { id: input.customerId, tenant_id: tenantId },
    select: { id: true, name: true },
  });

  if (!customer) {
    return { ok: false, error: "Pelanggan tidak ditemukan di tenant ini." };
  }

  const eggGradeIds = [...new Set(input.items.map((i) => i.eggGradeId))];
  const eggGrades = await prisma.eggGrade.findMany({
    where: { id: { in: eggGradeIds } },
    select: { id: true },
  });

  if (eggGrades.length !== eggGradeIds.length) {
    return { ok: false, error: "Satu atau lebih grade telur tidak ditemukan." };
  }

  const totalAmount = computeSalesOrderTotal(input.items);
  const saleDate = normalizeBusinessDate(input.saleDate);

  try {
    const sale = await prisma.$transaction(async (tx) => {
      const order = await tx.salesOrder.create({
        data: {
          tenant_id: tenantId,
          customer_id: input.customerId,
          sale_date: saleDate,
          status: "Paid",
          total_amount: totalAmount,
          sales_order_items: {
            create: input.items.map((line) => ({
              egg_grade_id: line.eggGradeId,
              quantity: line.quantity,
              weight: line.weight,
              unit_price: line.unitPrice,
            })),
          },
        },
        select: { id: true },
      });

      await tx.cashflowTransaction.create({
        data: {
          tenant_id: tenantId,
          transaction_date: saleDate,
          type: "Income",
          reference_id: order.id,
          amount: totalAmount,
          description: `Penjualan telur - ${customer.name}`,
        },
      });

      return order;
    });

    return { ok: true, saleId: sale.id };
  } catch {
    return { ok: false, error: "Gagal membuat pesanan penjualan." };
  }
}
