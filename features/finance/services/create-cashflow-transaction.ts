import type { CreateCashflowTransactionInput } from "@/features/finance/schemas/cashflow-transaction";
import { normalizeBusinessDate } from "@/lib/business-date";
import prisma from "@/lib/prisma";

export type CreateCashflowTransactionResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function createCashflowTransaction(
  tenantId: string,
  input: CreateCashflowTransactionInput,
): Promise<CreateCashflowTransactionResult> {
  if (input.categoryId) {
    const category = await prisma.opexCategory.findFirst({
      where: { id: input.categoryId, tenant_id: tenantId },
      select: { id: true },
    });

    if (!category) {
      return { ok: false, error: "Kategori opex tidak ditemukan di tenant ini." };
    }
  }

  try {
    const transaction = await prisma.cashflowTransaction.create({
      data: {
        tenant_id: tenantId,
        transaction_date: normalizeBusinessDate(input.transactionDate),
        type: input.type,
        category_id: input.categoryId ?? null,
        amount: input.amount,
        description: input.description ?? null,
      },
      select: { id: true },
    });

    return { ok: true, id: transaction.id };
  } catch {
    return { ok: false, error: "Gagal membuat transaksi kas." };
  }
}
