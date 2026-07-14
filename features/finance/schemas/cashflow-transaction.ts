import { z } from "zod";
import { businessDateNotFutureSchema } from "@/lib/business-date";
import { CASHFLOW_TYPES } from "@/features/finance/lib/cashflow-labels";

export const createCashflowTransactionSchema = z
  .object({
    transactionDate: businessDateNotFutureSchema,
    type: z.enum(CASHFLOW_TYPES, { message: "Pilih jenis transaksi." }),
    categoryId: z.preprocess(
      (v) => (v === "" || v === null || v === undefined ? undefined : v),
      z.coerce.number().int().positive().optional(),
    ),
    amount: z.coerce
      .number({ message: "Jumlah harus berupa angka." })
      .positive("Jumlah harus lebih dari 0."),
    description: z.preprocess(
      (v) => (v === "" || v === null || v === undefined ? undefined : v),
      z.string().trim().max(300, "Catatan maksimal 300 karakter.").optional(),
    ),
  })
  .superRefine((data, ctx) => {
    if (data.type === "Expense" && !data.categoryId) {
      ctx.addIssue({
        code: "custom",
        message: "Kategori opex wajib diisi untuk transaksi pengeluaran.",
        path: ["categoryId"],
      });
    }
  });

export type CreateCashflowTransactionInput = z.infer<
  typeof createCashflowTransactionSchema
>;
