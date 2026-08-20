import { describe, expect, test } from "bun:test";

import { applyEggStockMutation, type TxClient } from "./apply-egg-stock-mutation";
import { EggMovementType } from "@/features/eggs/lib/egg-mutation-types";

const TENANT = "tenant-1";
const GRADE = 3;
const LOC = "loc-1";

/**
 * Minimal in-memory fake of the Prisma transaction client covering only the
 * methods `applyEggStockMutation` uses, so we can exercise the stock math and
 * branching without a database.
 */
function makeTx(opts: { startQuantity: number | null }) {
  let quantity = opts.startQuantity;
  const movements: Array<{
    mutation_type: string;
    quantity: number;
    tenant_id: string;
    egg_grade_id: number;
    location_id: string;
  }> = [];

  const tx = {
    location: {
      findFirst: async ({ where }: { where: { id: string; tenant_id: string } }) =>
        where.id === LOC && where.tenant_id === TENANT ? { id: LOC } : null,
    },
    eggStock: {
      upsert: async ({
        update,
        create,
      }: {
        update: { quantity?: { increment?: number; decrement?: number } };
        create: { quantity: number; tenant_id: string };
      }) => {
        if (quantity == null) {
          quantity = create.quantity;
        } else if (update.quantity?.increment != null) {
          quantity += update.quantity.increment;
        } else if (update.quantity?.decrement != null) {
          quantity -= update.quantity.decrement;
        }
        return { quantity };
      },
      updateMany: async ({
        where,
        data,
      }: {
        where: { tenant_id: string; quantity?: { gte?: number } };
        data: { quantity: { decrement: number } };
      }) => {
        const gte = where.quantity?.gte ?? 0;
        if (quantity != null && quantity >= gte) {
          quantity -= data.quantity.decrement;
          return { count: 1 };
        }
        return { count: 0 };
      },
      findUnique: async () => (quantity == null ? null : { quantity }),
    },
    eggMovement: {
      create: async ({
        data,
      }: {
        data: {
          mutation_type: string;
          quantity: number;
          tenant_id: string;
          egg_grade_id: number;
          location_id: string;
        };
      }) => {
        movements.push(data);
        return data;
      },
    },
  };

  return { tx: tx as unknown as TxClient, movements, getQuantity: () => quantity };
}

describe("applyEggStockMutation", () => {
  test("IN increments per-grade stock and logs an IN movement", async () => {
    const { tx, movements, getQuantity } = makeTx({ startQuantity: 500 });

    const result = await applyEggStockMutation(tx, {
      tenantId: TENANT,
      eggGradeId: GRADE,
      locationId: LOC,
      mutationType: EggMovementType.IN_HARVEST,
      quantity: 250,
    });

    expect(result).toEqual({ ok: true, newQuantity: 750 });
    expect(getQuantity()).toBe(750);
    expect(movements[0]).toMatchObject({
      mutation_type: EggMovementType.IN_HARVEST,
      quantity: 250,
      tenant_id: TENANT,
      egg_grade_id: GRADE,
      location_id: LOC,
    });
  });

  test("OUT with sufficient stock decrements and logs an OUT movement", async () => {
    const { tx, movements } = makeTx({ startQuantity: 500 });

    const result = await applyEggStockMutation(tx, {
      tenantId: TENANT,
      eggGradeId: GRADE,
      locationId: LOC,
      mutationType: EggMovementType.OUT_SALES,
      quantity: 200,
    });

    expect(result).toEqual({ ok: true, newQuantity: 300 });
    expect(movements[0]?.mutation_type).toBe(EggMovementType.OUT_SALES);
  });

  test("OUT rejects when stock is insufficient for that grade (no oversell)", async () => {
    const { tx } = makeTx({ startQuantity: 50 });

    const result = await applyEggStockMutation(tx, {
      tenantId: TENANT,
      eggGradeId: GRADE,
      locationId: LOC,
      mutationType: EggMovementType.OUT_SALES,
      quantity: 200,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("tidak mencukupi");
    }
  });

  test("OUT rejects when no stock row exists", async () => {
    const { tx } = makeTx({ startQuantity: null });

    const result = await applyEggStockMutation(tx, {
      tenantId: TENANT,
      eggGradeId: GRADE,
      locationId: LOC,
      mutationType: EggMovementType.OUT_SALES,
      quantity: 1,
    });

    expect(result.ok).toBe(false);
  });

  test("rejects non-positive quantity", async () => {
    const { tx } = makeTx({ startQuantity: 500 });

    const zero = await applyEggStockMutation(tx, {
      tenantId: TENANT,
      eggGradeId: GRADE,
      locationId: LOC,
      mutationType: EggMovementType.IN_HARVEST,
      quantity: 0,
    });
    expect(zero.ok).toBe(false);

    const negative = await applyEggStockMutation(tx, {
      tenantId: TENANT,
      eggGradeId: GRADE,
      locationId: LOC,
      mutationType: EggMovementType.IN_HARVEST,
      quantity: -5,
    });
    expect(negative.ok).toBe(false);
  });

  test("rejects a location that belongs to another tenant", async () => {
    const { tx } = makeTx({ startQuantity: 500 });

    const result = await applyEggStockMutation(tx, {
      tenantId: TENANT,
      eggGradeId: GRADE,
      locationId: "loc-other-tenant",
      mutationType: EggMovementType.IN_HARVEST,
      quantity: 10,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("Lokasi gudang");
    }
  });

  test("OUT with allowNegative bypasses the stock guard (reconciliation)", async () => {
    const { tx } = makeTx({ startQuantity: 10 });

    const result = await applyEggStockMutation(tx, {
      tenantId: TENANT,
      eggGradeId: GRADE,
      locationId: LOC,
      mutationType: EggMovementType.OUT_ADJUSTMENT,
      quantity: 25,
      allowNegative: true,
    });

    expect(result).toEqual({ ok: true, newQuantity: -15 });
  });
});