import {
  applyStockMutation as defaultApplyStockMutation,
} from "@/features/inventory/services/apply-stock-mutation";
import { StockMutationType } from "@/features/inventory/lib/stock-mutation-types";
import type { CreateSalesOrderInput } from "@/features/finance/schemas/sales-order";
import { computeSalesOrderTotal } from "@/features/finance/lib/compute-sales-total";
import { normalizeBusinessDate } from "@/lib/business-date";
import defaultPrisma from "@/lib/prisma";

export type CreateSalesOrderResult =
  | { ok: true; saleId: string }
  | { ok: false; error: string };

class StockError extends Error {}

export type CreateSalesOrderOptions = {
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

export async function createSalesOrder(
  tenantId: string,
  input: CreateSalesOrderInput,
  options: CreateSalesOrderOptions = {},
): Promise<CreateSalesOrderResult> {
  const prisma = options.deps?.prisma ?? defaultPrisma;
  const applyStockMutation =
    options.deps?.applyStockMutation ?? defaultApplyStockMutation;

  const customer = await prisma.customer.findFirst({
    where: { id: input.customerId, tenant_id: tenantId },
    select: { id: true, name: true },
  });

  if (!customer) {
    return { ok: false, error: "Pelanggan tidak ditemukan di tenant ini." };
  }

  const location = await prisma.location.findFirst({
    where: { id: input.locationId, tenant_id: tenantId },
    select: { id: true },
  });

  if (!location) {
    return { ok: false, error: "Lokasi gudang tidak ditemukan di tenant ini." };
  }

  const eggGradeIds = [
    ...new Set(
      input.items
        .map((i) => i.eggGradeId)
        .filter((id): id is number => id != null),
    ),
  ];

  if (eggGradeIds.length > 0) {
    const eggGrades = await prisma.eggGrade.findMany({
      where: { id: { in: eggGradeIds } },
      select: { id: true },
    });

    if (eggGrades.length !== eggGradeIds.length) {
      return { ok: false, error: "Satu atau lebih grade telur tidak ditemukan." };
    }
  }

  const eggItem = await prisma.item.findFirst({
    where: { tenant_id: tenantId, type: "Egg" },
    select: { id: true },
  });

  if (!eggItem) {
    return {
      ok: false,
      error: "Item telur belum dikonfigurasi. Hubungi admin inventori.",
    };
  }

  const totalEggs = input.items.reduce((sum, line) => sum + line.quantity, 0);
  const totalWeight = input.items.reduce(
    (sum, line) => sum + (line.weight ?? 0),
    0,
  );
  const totalAmount = computeSalesOrderTotal(input.items);
  const saleDate = normalizeBusinessDate(input.saleDate);

  try {
    const sale = await prisma.$transaction(async (tx) => {
      const order = await tx.salesOrder.create({
        data: {
          tenant_id: tenantId,
          customer_id: input.customerId,
          location_id: input.locationId,
          sale_date: saleDate,
          status: "Paid",
          total_amount: totalAmount,
          sales_order_items: {
            create: input.items.map((line) => ({
              egg_grade_id: line.eggGradeId ?? null,
              quantity: line.quantity,
              weight: line.weight ?? null,
              unit_price: line.unitPrice,
            })),
          },
        },
        select: { id: true },
      });

      await tx.deliveryLog.create({
        data: {
          tenant_id: tenantId,
          sale_id: order.id,
          delivery_date: saleDate,
          status: "Delivered",
          quantity: totalEggs,
          weight: totalWeight > 0 ? totalWeight : null,
          notes: `Surat jalan otomatis - ${customer.name}`,
        },
      });

      const stock = await applyStockMutation(tx, {
        itemId: eggItem.id,
        locationId: input.locationId,
        mutationType: StockMutationType.OUT_SALES,
        quantity: totalEggs,
        referenceId: order.id,
      });

      if (!stock.ok) {
        throw new StockError(stock.error);
      }

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
  } catch (err) {
    if (err instanceof StockError) {
      return { ok: false, error: err.message };
    }
    return { ok: false, error: "Gagal membuat pesanan penjualan." };
  }
}
