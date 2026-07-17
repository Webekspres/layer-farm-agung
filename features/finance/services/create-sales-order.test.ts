import { beforeEach, describe, expect, mock, test } from "bun:test";
import {
  createSalesOrder,
  type CreateSalesOrderOptions,
} from "./create-sales-order";
import { StockMutationType } from "@/features/inventory/lib/stock-mutation-types";
import type { CreateSalesOrderInput } from "@/features/finance/schemas/sales-order";
import { parseBusinessDate } from "@/lib/business-date";

/**
 * These tests inject fakes via `options.deps` rather than `mock.module`,
 * because Bun's `mock.module` replaces a module for the whole test run (no
 * per-file restore) and would otherwise break every other test importing the
 * real `@/lib/prisma` / `apply-stock-mutation`.
 */

type StockMutationResult =
  | { ok: true; newQuantity: number; lowStock: boolean; minStockAlert: number | null }
  | { ok: false; error: string };

const TENANT = "00000000-0000-4000-8000-000000000001";
const CUSTOMER = "00000000-0000-4000-8000-000000000010";
const LOCATION = "00000000-0000-4000-8000-000000000020";
const EGG_ITEM = "00000000-0000-4000-8000-000000000030";
const SALE_ID = "00000000-0000-4000-8000-000000000040";

const findFirstCustomer = mock(() =>
  Promise.resolve({ id: CUSTOMER, name: "Buyer A" } as {
    id: string;
    name: string;
  } | null),
);
const findFirstLocation = mock(() =>
  Promise.resolve({ id: LOCATION } as { id: string } | null),
);
const findManyEggGrade = mock(() =>
  Promise.resolve([{ id: 1 }] as { id: number }[]),
);
const findFirstEggItem = mock(() =>
  Promise.resolve({ id: EGG_ITEM } as { id: string } | null),
);
const salesOrderCreate = mock(() =>
  Promise.resolve({ id: SALE_ID }),
);
const cashflowCreate = mock(() => Promise.resolve({}));

const applyStockMutation = mock(
  (): Promise<StockMutationResult> =>
    Promise.resolve({
      ok: true,
      newQuantity: 50,
      lowStock: false,
      minStockAlert: null,
    }),
);

const fakePrisma = {
  customer: { findFirst: findFirstCustomer },
  location: { findFirst: findFirstLocation },
  eggGrade: { findMany: findManyEggGrade },
  item: { findFirst: findFirstEggItem },
  $transaction: async (fn: (tx: unknown) => Promise<unknown>) =>
    fn({
      salesOrder: { create: salesOrderCreate },
      cashflowTransaction: { create: cashflowCreate },
    }),
};

const deps = {
  prisma: fakePrisma,
  applyStockMutation,
} as unknown as CreateSalesOrderOptions["deps"];

function baseInput(
  overrides: Partial<CreateSalesOrderInput> = {},
): CreateSalesOrderInput {
  return {
    customerId: CUSTOMER,
    locationId: LOCATION,
    saleDate: parseBusinessDate("2026-07-09"),
    items: [{ quantity: 100, unitPrice: 2000 }],
    ...overrides,
  };
}

describe("createSalesOrder", () => {
  beforeEach(() => {
    findFirstCustomer.mockReset();
    findFirstCustomer.mockResolvedValue({ id: CUSTOMER, name: "Buyer A" });
    findFirstLocation.mockReset();
    findFirstLocation.mockResolvedValue({ id: LOCATION });
    findManyEggGrade.mockReset();
    findManyEggGrade.mockResolvedValue([{ id: 1 }]);
    findFirstEggItem.mockReset();
    findFirstEggItem.mockResolvedValue({ id: EGG_ITEM });
    salesOrderCreate.mockReset();
    salesOrderCreate.mockResolvedValue({ id: SALE_ID });
    cashflowCreate.mockReset();
    cashflowCreate.mockResolvedValue({});
    applyStockMutation.mockReset();
    applyStockMutation.mockResolvedValue({
      ok: true,
      newQuantity: 50,
      lowStock: false,
      minStockAlert: null,
    });
  });

  test("succeeds with OUT_SALES for total line quantity and creates cashflow", async () => {
    const result = await createSalesOrder(
      TENANT,
      baseInput({
        items: [
          { quantity: 40, unitPrice: 2000 },
          { eggGradeId: 1, quantity: 60, weight: 3.5, unitPrice: 2100 },
        ],
      }),
      { deps },
    );

    expect(result).toEqual({ ok: true, saleId: SALE_ID });
    expect(applyStockMutation).toHaveBeenCalledTimes(1);
    const [, params] = applyStockMutation.mock.calls[0];
    expect(params).toMatchObject({
      itemId: EGG_ITEM,
      locationId: LOCATION,
      mutationType: StockMutationType.OUT_SALES,
      quantity: 100,
      referenceId: SALE_ID,
    });
    expect(cashflowCreate).toHaveBeenCalledTimes(1);
  });

  test("fails when egg stock is insufficient", async () => {
    applyStockMutation.mockResolvedValue({
      ok: false,
      error: "Stok tidak mencukupi untuk jumlah yang dimasukkan.",
    });

    const result = await createSalesOrder(TENANT, baseInput(), { deps });

    expect(result).toEqual({
      ok: false,
      error: "Stok tidak mencukupi untuk jumlah yang dimasukkan.",
    });
    expect(cashflowCreate).not.toHaveBeenCalled();
  });

  test("fails when location is missing", async () => {
    findFirstLocation.mockResolvedValue(null);

    const result = await createSalesOrder(TENANT, baseInput(), { deps });

    expect(result).toEqual({
      ok: false,
      error: "Lokasi gudang tidak ditemukan di tenant ini.",
    });
    expect(applyStockMutation).not.toHaveBeenCalled();
  });

  test("fails when egg item is not configured", async () => {
    findFirstEggItem.mockResolvedValue(null);

    const result = await createSalesOrder(TENANT, baseInput(), { deps });

    expect(result).toEqual({
      ok: false,
      error: "Item telur belum dikonfigurasi. Hubungi admin inventori.",
    });
  });

  test("fails when customer is missing", async () => {
    findFirstCustomer.mockResolvedValue(null);

    const result = await createSalesOrder(TENANT, baseInput(), { deps });

    expect(result).toEqual({
      ok: false,
      error: "Pelanggan tidak ditemukan di tenant ini.",
    });
  });
});
