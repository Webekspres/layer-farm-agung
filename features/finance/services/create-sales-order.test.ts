import { beforeEach, describe, expect, mock, test } from "bun:test";
import {
  createSalesOrder,
  type CreateSalesOrderOptions,
} from "./create-sales-order";
import { EggMovementType } from "@/features/eggs/lib/egg-mutation-types";
import type { ApplyEggStockMutationParams } from "@/features/eggs/services/apply-egg-stock-mutation";
import type { CreateSalesOrderInput } from "@/features/finance/schemas/sales-order";
import { parseBusinessDate } from "@/lib/business-date";

/**
 * These tests inject fakes via `options.deps` rather than `mock.module`,
 * because Bun's `mock.module` replaces a module for the whole test run (no
 * per-file restore) and would otherwise break every other test importing the
 * real `@/lib/prisma` / `apply-egg-stock-mutation`.
 */

type EggStockMutationResult =
  | { ok: true; newQuantity: number }
  | { ok: false; error: string };

const TENANT = "00000000-0000-4000-8000-000000000001";
const CUSTOMER = "00000000-0000-4000-8000-000000000010";
const LOCATION = "00000000-0000-4000-8000-000000000020";
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
  Promise.resolve([
    { id: 1, is_active: true },
    { id: 2, is_active: true },
  ] as { id: number; is_active: boolean }[]),
);
const salesOrderCreate = mock(() =>
  Promise.resolve({ id: SALE_ID }),
);
const deliveryCreate = mock(() => Promise.resolve({}));
const cashflowCreate = mock(() => Promise.resolve({}));

const applyEggStockMutation = mock(
  (): Promise<EggStockMutationResult> =>
    Promise.resolve({ ok: true, newQuantity: 50 }),
);

const fakePrisma = {
  customer: { findFirst: findFirstCustomer },
  location: { findFirst: findFirstLocation },
  eggGrade: { findMany: findManyEggGrade },
  $transaction: async (fn: (tx: unknown) => Promise<unknown>) =>
    fn({
      salesOrder: { create: salesOrderCreate },
      deliveryLog: { create: deliveryCreate },
      cashflowTransaction: { create: cashflowCreate },
    }),
};

const deps = {
  prisma: fakePrisma,
  applyEggStockMutation,
} as unknown as CreateSalesOrderOptions["deps"];

function baseInput(
  overrides: Partial<CreateSalesOrderInput> = {},
): CreateSalesOrderInput {
  return {
    customerId: CUSTOMER,
    locationId: LOCATION,
    saleDate: parseBusinessDate("2026-07-09"),
    items: [{ eggGradeId: 1, quantity: 100, unitPrice: 2000 }],
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
    findManyEggGrade.mockResolvedValue([
      { id: 1, is_active: true },
      { id: 2, is_active: true },
    ]);
    salesOrderCreate.mockReset();
    salesOrderCreate.mockResolvedValue({ id: SALE_ID });
    deliveryCreate.mockReset();
    deliveryCreate.mockResolvedValue({});
    cashflowCreate.mockReset();
    cashflowCreate.mockResolvedValue({});
    applyEggStockMutation.mockReset();
    applyEggStockMutation.mockResolvedValue({ ok: true, newQuantity: 50 });
  });

  test("deducts OUT_SALES per grade line and creates delivery/cashflow", async () => {
    const result = await createSalesOrder(
      TENANT,
      baseInput({
        items: [
          { eggGradeId: 1, quantity: 40, unitPrice: 2000 },
          { eggGradeId: 2, quantity: 60, weight: 3.5, unitPrice: 2100 },
        ],
      }),
      { deps },
    );

    expect(result).toEqual({ ok: true, saleId: SALE_ID });
    expect(findManyEggGrade).toHaveBeenCalledTimes(1);
    expect(applyEggStockMutation).toHaveBeenCalledTimes(2);
    const stockCalls = applyEggStockMutation.mock.calls as unknown as Array<
      [unknown, ApplyEggStockMutationParams]
    >;
    const [grade1Params, grade2Params] = stockCalls.map(([, p]) => p);
    expect(grade1Params).toMatchObject({
      tenantId: TENANT,
      eggGradeId: 1,
      locationId: LOCATION,
      mutationType: EggMovementType.OUT_SALES,
      quantity: 40,
      referenceId: SALE_ID,
    });
    expect(grade2Params).toMatchObject({
      tenantId: TENANT,
      eggGradeId: 2,
      mutationType: EggMovementType.OUT_SALES,
      quantity: 60,
      referenceId: SALE_ID,
    });
    expect(deliveryCreate).toHaveBeenCalledTimes(1);
    const deliveryCalls = deliveryCreate.mock.calls as unknown as Array<
      [{ data: { tenant_id: string; sale_id: string; status: string; quantity: number; weight: number } }]
    >;
    const [deliveryArgs] = deliveryCalls[0] ?? [];
    expect(deliveryArgs).toBeDefined();
    if (!deliveryArgs) return;
    expect(deliveryArgs.data).toMatchObject({
      tenant_id: TENANT,
      sale_id: SALE_ID,
      status: "Delivered",
      quantity: 100,
      weight: 3.5,
    });
    expect(cashflowCreate).toHaveBeenCalledTimes(1);
  });

  test("fails when stock is insufficient for one grade", async () => {
    applyEggStockMutation.mockResolvedValueOnce({ ok: true, newQuantity: 50 });
    applyEggStockMutation.mockResolvedValueOnce({
      ok: false,
      error: "Stok telur tidak mencukupi untuk grade tersebut.",
    });

    const result = await createSalesOrder(
      TENANT,
      baseInput({
        items: [
          { eggGradeId: 1, quantity: 40, unitPrice: 2000 },
          { eggGradeId: 2, quantity: 60, unitPrice: 2100 },
        ],
      }),
      { deps },
    );

    expect(result).toEqual({
      ok: false,
      error: "Stok telur tidak mencukupi untuk grade tersebut.",
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
    expect(applyEggStockMutation).not.toHaveBeenCalled();
  });

  test("fails when a grade is inactive", async () => {
    findManyEggGrade.mockResolvedValue([{ id: 1, is_active: false }]);

    const result = await createSalesOrder(TENANT, baseInput(), { deps });

    expect(result).toEqual({
      ok: false,
      error: "Satu atau lebih grade telur tidak aktif.",
    });
    expect(applyEggStockMutation).not.toHaveBeenCalled();
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