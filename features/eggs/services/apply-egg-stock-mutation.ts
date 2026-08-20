import type { Prisma } from "@/generated/prisma/client";
import { eggDirectionOf } from "@/features/eggs/lib/egg-mutation-types";

/**
 * A Prisma transaction client. `applyEggStockMutation` never opens its own
 * transaction — the caller must run it inside `prisma.$transaction(...)` so the
 * source record (DailyProduction / SalesOrder) and the egg movement are
 * written atomically.
 */
export type TxClient = Prisma.TransactionClient;

export type ApplyEggStockMutationParams = {
  /** Tenant owning the stock. Must match the location's tenant. */
  tenantId: string;
  /** EggGrade whose balance moves (sellable per grade). */
  eggGradeId: number;
  /** Location holding the stock (warehouse or a cage's `location_id`). */
  locationId: string;
  /** One of {@link EggMovementType}; its prefix decides IN vs OUT. */
  mutationType: string;
  /** Positive magnitude of the movement, in butir (eggs). */
  quantity: number;
  /** Id of the source record (for the audit ledger). */
  referenceId?: string | null;
  /**
   * Reconciliation escape hatch: when true, an OUT is applied even if it drives
   * the balance below zero (used only when correcting/voiding a previous IN,
   * e.g. editing a harvest downward). Default false → OUT rejects on insufficient
   * stock for that grade at that location.
   */
  allowNegative?: boolean;
};

export type ApplyEggStockMutationResult =
  | { ok: true; newQuantity: number }
  | { ok: false; error: string };

export type ApplyEggStockMutation = (
  tx: TxClient,
  params: ApplyEggStockMutationParams,
) => Promise<ApplyEggStockMutationResult>;

/**
 * Atomically increment/decrement an `(egg grade, location)` stock balance and
 * append an `EggMovement` ledger row, inside the caller's transaction.
 *
 * The location is verified to belong to `tenantId` so a cross-tenant location id
 * can never be applied to the tenant's egg stock. OUT movements use a DB-level
 * guarded decrement (`quantity >= amount`) so two concurrent submits can never
 * oversell the same grade/location without row locks.
 */
export async function applyEggStockMutation(
  tx: TxClient,
  params: ApplyEggStockMutationParams,
): Promise<ApplyEggStockMutationResult> {
  const { tenantId, eggGradeId, locationId, mutationType, referenceId } = params;
  const quantity = params.quantity;

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return { ok: false, error: "Jumlah mutasi stok telur harus lebih dari 0." };
  }

  const location = await tx.location.findFirst({
    where: { id: locationId, tenant_id: tenantId },
    select: { id: true },
  });

  if (!location) {
    return {
      ok: false,
      error: "Lokasi gudang tidak ditemukan di tenant ini.",
    };
  }

  const direction = eggDirectionOf(mutationType);

  if (direction === "IN") {
    const stock = await tx.eggStock.upsert({
      where: {
        egg_grade_id_location_id: { egg_grade_id: eggGradeId, location_id: locationId },
      },
      update: { quantity: { increment: quantity } },
      create: {
        tenant_id: tenantId,
        egg_grade_id: eggGradeId,
        location_id: locationId,
        quantity,
      },
      select: { quantity: true },
    });

    await tx.eggMovement.create({
      data: {
        tenant_id: tenantId,
        egg_grade_id: eggGradeId,
        location_id: locationId,
        mutation_type: mutationType,
        quantity,
        reference_id: referenceId ?? null,
      },
    });

    return { ok: true, newQuantity: stock.quantity };
  }

  // direction === "OUT"
  if (params.allowNegative) {
    // Reconciliation: decrement (may create the row), no stock guard.
    const stock = await tx.eggStock.upsert({
      where: {
        egg_grade_id_location_id: { egg_grade_id: eggGradeId, location_id: locationId },
      },
      update: { quantity: { decrement: quantity } },
      create: {
        tenant_id: tenantId,
        egg_grade_id: eggGradeId,
        location_id: locationId,
        quantity: -quantity,
      },
      select: { quantity: true },
    });

    await tx.eggMovement.create({
      data: {
        tenant_id: tenantId,
        egg_grade_id: eggGradeId,
        location_id: locationId,
        mutation_type: mutationType,
        quantity,
        reference_id: referenceId ?? null,
      },
    });

    return { ok: true, newQuantity: stock.quantity };
  }

  // Guarded decrement: only succeeds if there is enough stock for this grade.
  const updated = await tx.eggStock.updateMany({
    where: {
      tenant_id: tenantId,
      egg_grade_id: eggGradeId,
      location_id: locationId,
      quantity: { gte: quantity },
    },
    data: { quantity: { decrement: quantity } },
  });

  if (updated.count === 0) {
    return {
      ok: false,
      error: "Stok telur tidak mencukupi untuk grade tersebut.",
    };
  }

  const stock = await tx.eggStock.findUnique({
    where: {
      egg_grade_id_location_id: { egg_grade_id: eggGradeId, location_id: locationId },
    },
    select: { quantity: true },
  });

  await tx.eggMovement.create({
    data: {
      tenant_id: tenantId,
      egg_grade_id: eggGradeId,
      location_id: locationId,
      mutation_type: mutationType,
      quantity,
      reference_id: referenceId ?? null,
    },
  });

  return { ok: true, newQuantity: stock?.quantity ?? 0 };
}