import {
  isUserAssignedToCage as defaultIsUserAssignedToCage,
} from "@/features/cages/services/is-user-assigned-to-cage";
import {
  applyStockMutation as defaultApplyStockMutation,
} from "@/features/inventory/services/apply-stock-mutation";
import { StockMutationType } from "@/features/inventory/lib/stock-mutation-types";
import { isPrismaUniqueViolation } from "@/features/production/lib/client-mutation-id";
import type { CompleteVaccinationInput } from "@/features/health/schemas/vaccine-schedule";
import { ItemType } from "@/generated/prisma/enums";
import defaultPrisma from "@/lib/prisma";

export type CompleteVaccinationResult =
  | {
      ok: true;
      idempotent: boolean;
      scheduleId: string;
      lowStock: boolean;
      remainingStock: number | null;
    }
  | { ok: false; error: string };

class StockError extends Error {}
class AlreadyCompletedError extends Error {}

export type CompleteVaccinationOptions = {
  /**
   * Skip the "staff assigned to cage" check. Used by the admin dashboard
   * action, where a tenant admin (not necessarily assigned) may record/
   * correct a completion. Mobile API calls must keep this false so only
   * assigned staff can complete a schedule.
   */
  skipAssignmentCheck?: boolean;
  /**
   * Test-only seams. Bun's `mock.module` replaces a module for the whole
   * process (no per-file restore), which would otherwise break unrelated
   * tests importing the real `@/lib/prisma` / `apply-stock-mutation`. Inject
   * fakes here instead; production callers never set these.
   */
  deps?: {
    prisma?: typeof defaultPrisma;
    applyStockMutation?: typeof defaultApplyStockMutation;
    isUserAssignedToCage?: typeof defaultIsUserAssignedToCage;
  };
};

export async function completeVaccination(
  tenantId: string,
  userId: string,
  input: CompleteVaccinationInput,
  options: CompleteVaccinationOptions = {},
): Promise<CompleteVaccinationResult> {
  const prisma = options.deps?.prisma ?? defaultPrisma;
  const applyStockMutation =
    options.deps?.applyStockMutation ?? defaultApplyStockMutation;
  const isUserAssignedToCage =
    options.deps?.isUserAssignedToCage ?? defaultIsUserAssignedToCage;

  if (input.clientMutationId) {
    const existing = await prisma.vaccineSchedule.findUnique({
      where: { client_mutation_id: input.clientMutationId },
      select: { id: true },
    });

    if (existing) {
      return {
        ok: true,
        idempotent: true,
        scheduleId: existing.id,
        lowStock: false,
        remainingStock: null,
      };
    }
  }

  const schedule = await prisma.vaccineSchedule.findFirst({
    where: {
      id: input.scheduleId,
      cage: { location: { tenant_id: tenantId } },
    },
    select: {
      id: true,
      status: true,
      cage_id: true,
      item_id: true,
      notes: true,
      cage: { select: { location_id: true } },
      item: { select: { type: true } },
    },
  });

  if (!schedule) {
    return { ok: false, error: "Jadwal vaksinasi tidak ditemukan di tenant ini." };
  }

  if (schedule.status !== "Pending") {
    return {
      ok: false,
      error: "Jadwal vaksinasi sudah diselesaikan atau dibatalkan.",
    };
  }

  if (schedule.item.type !== ItemType.Vaccine) {
    return { ok: false, error: "Item pada jadwal ini bukan vaksin." };
  }

  if (!options.skipAssignmentCheck) {
    const assigned = await isUserAssignedToCage(userId, schedule.cage_id);
    if (!assigned) {
      return { ok: false, error: "Anda tidak ditugaskan ke kandang ini." };
    }
  }

  const combinedNotes = input.notes
    ? [schedule.notes, `Catatan pelaksanaan: ${input.notes}`]
        .filter(Boolean)
        .join("\n\n")
    : schedule.notes;

  try {
    const outcome = await prisma.$transaction(async (tx) => {
      const updated = await tx.vaccineSchedule.updateMany({
        where: { id: schedule.id, status: "Pending" },
        data: {
          status: "Completed",
          quantity_used: input.quantityUsed,
          completed_by_user_id: userId,
          completed_at: new Date(),
          notes: combinedNotes,
          is_synced: !input.fromSync,
          client_mutation_id: input.clientMutationId ?? null,
        },
      });

      if (updated.count === 0) {
        throw new AlreadyCompletedError();
      }

      const stock = await applyStockMutation(tx, {
        itemId: schedule.item_id,
        locationId: schedule.cage.location_id,
        mutationType: StockMutationType.OUT_VACCINE,
        quantity: input.quantityUsed,
        referenceId: schedule.id,
      });

      if (!stock.ok) {
        throw new StockError(stock.error);
      }

      return { lowStock: stock.lowStock, remainingStock: stock.newQuantity };
    });

    return {
      ok: true,
      idempotent: false,
      scheduleId: schedule.id,
      lowStock: outcome.lowStock,
      remainingStock: outcome.remainingStock,
    };
  } catch (error) {
    if (input.clientMutationId && isPrismaUniqueViolation(error)) {
      const existing = await prisma.vaccineSchedule.findUnique({
        where: { client_mutation_id: input.clientMutationId },
        select: { id: true },
      });

      if (existing) {
        return {
          ok: true,
          idempotent: true,
          scheduleId: existing.id,
          lowStock: false,
          remainingStock: null,
        };
      }
    }

    if (error instanceof StockError) {
      return { ok: false, error: error.message };
    }

    if (error instanceof AlreadyCompletedError) {
      return {
        ok: false,
        error: "Jadwal vaksinasi sudah diselesaikan oleh proses lain.",
      };
    }

    return { ok: false, error: "Gagal menyelesaikan vaksinasi." };
  }
}
