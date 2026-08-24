import type { Prisma } from "@/generated/prisma/client";
import { isPrismaUniqueViolation } from "@/features/production/lib/client-mutation-id";
import type { CorrectionChange } from "@/features/production/schemas/correction-meta";
import { ensureDailyReport } from "@/features/production/services/ensure-daily-report";
import { normalizeBusinessDate } from "@/lib/business-date";
import prisma from "@/lib/prisma";

type Tx = Prisma.TransactionClient;

export type RecordCorrectionEventInput = {
  tenantId: string;
  cageId: string;
  recordDate: Date;
  actorUserId: string;
  reason: string;
  changes: CorrectionChange[];
  clientMutationId?: string;
};

export type RecordCorrectionEventResult =
  | { ok: true; idempotent: boolean; correctionId: string }
  | { ok: false; error: string; status: 400 };

/**
 * Append-only correction audit row. Call inside or outside a transaction
 * after domain updates have succeeded (or wrap together with domain updates).
 */
export async function recordCorrectionEvent(
  input: RecordCorrectionEventInput,
  db: Tx | typeof prisma = prisma,
): Promise<RecordCorrectionEventResult> {
  if (input.changes.length === 0) {
    return { ok: false, error: "Tidak ada perubahan untuk dikoreksi.", status: 400 };
  }

  if (input.clientMutationId) {
    const existing = await db.dailyInputCorrection.findUnique({
      where: { client_mutation_id: input.clientMutationId },
      select: { id: true },
    });
    if (existing) {
      return { ok: true, idempotent: true, correctionId: existing.id };
    }
  }

  const report = await ensureDailyReport(
    input.tenantId,
    input.cageId,
    normalizeBusinessDate(input.recordDate),
    db,
  );

  try {
    const created = await db.dailyInputCorrection.create({
      data: {
        daily_report_id: report.id,
        actor_user_id: input.actorUserId,
        reason: input.reason.trim(),
        changes: input.changes as Prisma.InputJsonValue,
        client_mutation_id: input.clientMutationId ?? null,
      },
      select: { id: true },
    });
    return { ok: true, idempotent: false, correctionId: created.id };
  } catch (error) {
    if (input.clientMutationId && isPrismaUniqueViolation(error)) {
      const raced = await db.dailyInputCorrection.findUnique({
        where: { client_mutation_id: input.clientMutationId },
        select: { id: true },
      });
      if (raced) {
        return { ok: true, idempotent: true, correctionId: raced.id };
      }
    }
    return { ok: false, error: "Gagal menyimpan riwayat koreksi.", status: 400 };
  }
}
