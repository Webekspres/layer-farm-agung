import { isUserAssignedToCage } from "@/features/cages/services/is-user-assigned-to-cage";
import { applyStockMutation } from "@/features/inventory/services/apply-stock-mutation";
import { StockMutationType } from "@/features/inventory/lib/stock-mutation-types";
import {
  resolveUserRoleName,
  validateOperationalInputDate,
} from "@/features/production/lib/input-window";
import type { CorrectionChange } from "@/features/production/schemas/correction-meta";
import type { DeleteRecordInput } from "@/features/production/schemas/delete-record";
import { recordCorrectionEvent } from "@/features/production/services/record-correction-event";
import prisma from "@/lib/prisma";

export type DeleteFeedConsumptionResult =
  | { ok: true; correctionId: string; idempotent: boolean }
  | { ok: false; error: string; status: 400 | 403 | 404 };

class StockError extends Error {}

export async function deleteFeedConsumption(
  tenantId: string,
  userId: string,
  recordId: string,
  input: DeleteRecordInput,
): Promise<DeleteFeedConsumptionResult> {
  if (input.clientMutationId) {
    const existingCorrection = await prisma.dailyInputCorrection.findUnique({
      where: { client_mutation_id: input.clientMutationId },
      select: { id: true },
    });
    if (existingCorrection) {
      return {
        ok: true,
        correctionId: existingCorrection.id,
        idempotent: true,
      };
    }
  }

  const existing = await prisma.feedConsumption.findFirst({
    where: { id: recordId, tenant_id: tenantId },
    select: {
      id: true,
      cage_id: true,
      item_id: true,
      quantity: true,
      notes: true,
      record_date: true,
      cage: {
        select: {
          location_id: true,
          cycle_settings: {
            where: { status: "Active" },
            take: 1,
            select: { start_date: true, go_live_date: true, end_date: true },
          },
        },
      },
    },
  });

  if (!existing) {
    return {
      ok: false,
      error: "Catatan konsumsi pakan tidak ditemukan.",
      status: 404,
    };
  }

  const assigned = await isUserAssignedToCage(userId, existing.cage_id);

  if (!assigned) {
    return {
      ok: false,
      error: "Anda tidak ditugaskan ke kandang ini.",
      status: 403,
    };
  }

  const roleName = await resolveUserRoleName(userId);
  const windowCheck = await validateOperationalInputDate({
    tenantId,
    roleName,
    recordDate: existing.record_date,
    cycle: existing.cage.cycle_settings[0] ?? null,
  });
  if (!windowCheck.ok) {
    return { ok: false, error: windowCheck.error, status: 400 };
  }

  const changes: CorrectionChange[] = [
    {
      component: "feed",
      recordId,
      field: "quantity",
      before: existing.quantity,
      after: null,
    },
  ];
  if (existing.notes != null) {
    changes.push({
      component: "feed",
      recordId,
      field: "notes",
      before: existing.notes,
      after: null,
    });
  }

  try {
    const correctionId = await prisma.$transaction(async (tx) => {
      // Pakan yang dipakai (OUT_FEED saat create) dikembalikan ke stok.
      const stock = await applyStockMutation(tx, {
        itemId: existing.item_id,
        locationId: existing.cage.location_id,
        mutationType: StockMutationType.IN_ADJUSTMENT,
        quantity: existing.quantity,
        referenceId: recordId,
      });

      if (!stock.ok) {
        throw new StockError(stock.error);
      }

      await tx.feedConsumption.delete({ where: { id: recordId } });

      const recorded = await recordCorrectionEvent(
        {
          tenantId,
          cageId: existing.cage_id,
          recordDate: existing.record_date,
          actorUserId: userId,
          reason: input.reason,
          changes,
          clientMutationId: input.clientMutationId,
        },
        tx,
      );

      if (!recorded.ok) {
        throw new Error(recorded.error);
      }

      return recorded.correctionId;
    });

    return { ok: true, correctionId, idempotent: false };
  } catch (error) {
    if (error instanceof StockError) {
      return { ok: false, error: error.message, status: 400 };
    }
    return {
      ok: false,
      error: "Gagal menghapus konsumsi pakan.",
      status: 400,
    };
  }
}
