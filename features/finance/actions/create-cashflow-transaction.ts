"use server";

import { revalidatePath } from "next/cache";
import {
  getFinanceTenantScope,
  requireViewCashflowSession,
} from "@/features/finance/lib/access";
import { createCashflowTransactionSchema } from "@/features/finance/schemas/cashflow-transaction";
import { createCashflowTransaction } from "@/features/finance/services/create-cashflow-transaction";

export type CashflowTransactionFormState = {
  error?: string;
  success?: boolean;
};

export async function createCashflowTransactionAction(
  _prev: CashflowTransactionFormState,
  formData: FormData,
): Promise<CashflowTransactionFormState> {
  const session = await requireViewCashflowSession();
  const { tenantId, needsTenantSelection } = getFinanceTenantScope(session);

  if (needsTenantSelection || !tenantId) {
    return { error: "Pilih tenant aktif terlebih dahulu." };
  }

  const parsed = createCashflowTransactionSchema.safeParse({
    transactionDate: formData.get("transactionDate"),
    type: formData.get("type"),
    categoryId: formData.get("categoryId") || undefined,
    amount: formData.get("amount"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Data transaksi tidak valid.",
    };
  }

  const result = await createCashflowTransaction(tenantId, parsed.data);

  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/dashboard/finance");
  return { success: true };
}
