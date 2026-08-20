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

export type DeleteDailyProductionResult =
  | { ok: true; correctionId: string; idempotent: boolean }
  | { ok: false; error: string; status: 400 | 403 | 404 };

class StockError extends Error {}

export async function deleteDailyProduction(
  tenantId: string,
  userId: string,
  recordId: string,
  input: DeleteRecordInput,
): Promise<DeleteDailyProductionResult> {
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
    where: { id: recordId, tenant_id: tenantId },
    select: {
      id: true,
      cage_id: true,
      record_date: true,
      tb: true,
      weight: true,
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
      items: { select: { egg_grade_id: true, quantity: true } },
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

  const grades = await prisma.eggGrade.findMany({
    where: { id: { in: existing.items.map((item) => item.egg_grade_id) } },
    select: { id: true, code: true },
  });
  const gradeLabelById = new Map(
    grades.map((grade) => [grade.id, grade.code ?? `grade-${grade.id}`]),
  );

  // Audit append-only: setiap nilai yang dihapus dicatat before → after null.
  const changes: CorrectionChange[] = existing.items.map((item) => ({
    component: "production",
    recordId,
    field: gradeLabelById.get(item.egg_grade_id) ?? `grade-${item.egg_grade_id}`,
    before: item.quantity,
    after: null,
  }));
  if (existing.weight != null) {
    changes.push({
      component: "production",
      recordId,
      field: "weight",
      before: existing.weight,
      after: null,
    });
  }

  // Stok telur (IN_HARVEST saat create) dikembalikan via OUT_ADJUSTMENT.
  const eggItem =
    existing.tb > 0
      ? await prisma.item.findFirst({
          where: { tenant_id: tenantId, type: "Egg" },
          select: { id: true },
        })
      : null;

  try {
    const correctionId = await prisma.$transaction(async (tx) => {
      if (eggItem && existing.tb > 0) {
        const stock = await applyStockMutation(tx, {
          itemId: eggItem.id,
          locationId: existing.cage.location_id,
          mutationType: StockMutationType.OUT_ADJUSTMENT,
          quantity: existing.tb,
          referenceId: recordId,
          allowNegative: true,
        });

        if (!stock.ok) {
          throw new StockError(stock.error);
        }
      }

      await tx.dailyProductionItem.deleteMany({
        where: { production_id: recordId },
      });
      await tx.dailyProduction.delete({ where: { id: recordId } });

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
      error: "Gagal menghapus produksi harian.",
      status: 400,
    };
  }
}
