import { isUserAssignedToCage } from "@/features/cages/services/is-user-assigned-to-cage";
import { applyStockMutation } from "@/features/inventory/services/apply-stock-mutation";
import { StockMutationType } from "@/features/inventory/lib/stock-mutation-types";
import { resolveProductionBuckets } from "@/features/production/lib/production-grade-mapping";
import {
  resolveUserRoleName,
  validateOperationalInputDate,
} from "@/features/production/lib/input-window";
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
    where: { id: { in: input.entries.map((entry) => entry.eggGradeId) } },
    select: { id: true, code: true, is_active: true },
  });

  const resolved = resolveProductionBuckets(input.entries, grades);
  if (!resolved.ok) {
    return { ok: false, error: resolved.error, status: 400 };
  }

  const { tb, tr, tp } = resolved.buckets;

  const existingByGradeId = new Map(
    existing.items.map((item) => [item.egg_grade_id, item.quantity]),
  );
  const changes: CorrectionChange[] = [];
  const allGradeIds = new Set<number>([
    ...existingByGradeId.keys(),
    ...input.entries.map((entry) => entry.eggGradeId),
  ]);

  const gradeLabelById = new Map(grades.map((g) => [g.id, g.code ?? `grade-${g.id}`]));

  for (const gradeId of allGradeIds) {
    const before = existingByGradeId.get(gradeId) ?? 0;
    const after =
      input.entries.find((entry) => entry.eggGradeId === gradeId)?.quantity ?? 0;
    if (before !== after) {
      changes.push({
        component: "production",
        recordId,
        field: gradeLabelById.get(gradeId) ?? `grade-${gradeId}`,
        before,
        after,
      });
    }
  }

  const nextWeight = input.weight ?? null;
  if ((existing.weight ?? null) !== nextWeight) {
    changes.push({
      component: "production",
      recordId,
      field: "weight",
      before: existing.weight ?? null,
      after: nextWeight,
    });
  }

  if (changes.length === 0) {
    return {
      ok: false,
      error: "Tidak ada perubahan nilai untuk dikoreksi.",
      status: 400,
    };
  }

  const tbDelta = tb - existing.tb;
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
          tb,
          tr,
          tp,
          weight: input.weight ?? null,
        },
      });

      await tx.dailyProductionItem.deleteMany({
        where: { production_id: recordId },
      });
      await tx.dailyProductionItem.createMany({
        data: input.entries.map((entry) => ({
          production_id: recordId,
          egg_grade_id: entry.eggGradeId,
          quantity: entry.quantity,
        })),
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
