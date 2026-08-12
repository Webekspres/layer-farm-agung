import { isUserAssignedToCage } from "@/features/cages/services/is-user-assigned-to-cage";
import { applyStockMutation } from "@/features/inventory/services/apply-stock-mutation";
import { StockMutationType } from "@/features/inventory/lib/stock-mutation-types";
import type { CorrectionChange } from "@/features/production/schemas/correction-meta";
import type { UpdateDailyProductionInput } from "@/features/production/schemas/update-daily-production";
import { recordCorrectionEvent } from "@/features/production/services/record-correction-event";
import prisma from "@/lib/prisma";

export type UpdateDailyProductionResult =
  | { ok: true; correctionId: string; idempotent: boolean }
  | { ok: false; error: string; status: 400 | 403 | 404 };

export async function updateDailyProduction(
  tenantId: string,
  userId: string,
  recordId: string,
  input: UpdateDailyProductionInput,
): Promise<UpdateDailyProductionResult> {
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

  const existing = await prisma.dailyProduction.findFirst({
    where: {
      id: recordId,
      tenant_id: tenantId,
    },
    select: {
      id: true,
      cage_id: true,
      record_date: true,
      tb: true,
      tr: true,
      tp: true,
      cage: { select: { location_id: true } },
    },
  });

  if (!existing) {
    return {
      ok: false,
      error: "Catatan produksi tidak ditemukan.",
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

  const changes: CorrectionChange[] = [];
  if (existing.tb !== input.tb) {
    changes.push({
      component: "production",
      recordId,
      field: "tb",
      before: existing.tb,
      after: input.tb,
    });
  }
  if (existing.tr !== input.tr) {
    changes.push({
      component: "production",
      recordId,
      field: "tr",
      before: existing.tr,
      after: input.tr,
    });
  }
  if (existing.tp !== input.tp) {
    changes.push({
      component: "production",
      recordId,
      field: "tp",
      before: existing.tp,
      after: input.tp,
    });
  }

  if (changes.length === 0) {
    return {
      ok: false,
      error: "Tidak ada perubahan nilai untuk dikoreksi.",
      status: 400,
    };
  }

  const tbDelta = input.tb - existing.tb;
  const eggItem =
    tbDelta !== 0
      ? await prisma.item.findFirst({
          where: { tenant_id: tenantId, type: "Egg" },
          select: { id: true },
        })
      : null;

  try {
    const correctionId = await prisma.$transaction(async (tx) => {
      await tx.dailyProduction.update({
        where: { id: recordId },
        data: {
          tb: input.tb,
          tr: input.tr,
          tp: input.tp,
        },
      });

      if (eggItem && tbDelta !== 0) {
        await applyStockMutation(tx, {
          itemId: eggItem.id,
          locationId: existing.cage.location_id,
          mutationType:
            tbDelta > 0
              ? StockMutationType.IN_HARVEST
              : StockMutationType.OUT_ADJUSTMENT,
          quantity: Math.abs(tbDelta),
          referenceId: recordId,
          allowNegative: tbDelta < 0,
        });
      }

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
  } catch {
    return {
      ok: false,
      error: "Gagal memperbarui produksi harian.",
      status: 400,
    };
  }
}
