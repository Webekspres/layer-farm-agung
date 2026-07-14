import { z } from "zod";
import { businessDateNotFutureSchema } from "@/lib/business-date";

const lineItemSchema = z.object({
  eggGradeId: z.coerce
    .number({ message: "Grade telur tidak valid." })
    .int()
    .positive("Grade telur tidak valid."),
  quantity: z.coerce
    .number({ message: "Jumlah harus berupa angka." })
    .positive("Jumlah harus lebih dari 0."),
  weight: z.coerce
    .number({ message: "Berat harus berupa angka." })
    .positive("Berat harus lebih dari 0."),
  unitPrice: z.coerce
    .number({ message: "Harga satuan harus berupa angka." })
    .nonnegative("Harga satuan tidak boleh negatif."),
});

export const createSalesOrderSchema = z.object({
  customerId: z.string().uuid("Pelanggan tidak valid."),
  saleDate: businessDateNotFutureSchema,
  items: z.array(lineItemSchema).min(1, "Minimal satu baris penjualan."),
});

export type CreateSalesOrderInput = z.infer<typeof createSalesOrderSchema>;
