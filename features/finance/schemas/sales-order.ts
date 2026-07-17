import { z } from "zod";
import { businessDateNotFutureSchema } from "@/lib/business-date";

const optionalPositiveInt = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.coerce
    .number({ message: "Grade telur tidak valid." })
    .int()
    .positive("Grade telur tidak valid.")
    .optional(),
);

const optionalNonNegativeNumber = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.coerce
    .number({ message: "Berat harus berupa angka." })
    .nonnegative("Berat tidak boleh negatif.")
    .optional(),
);

const lineItemSchema = z.object({
  eggGradeId: optionalPositiveInt,
  quantity: z.coerce
    .number({ message: "Jumlah harus berupa angka." })
    .int("Jumlah harus bilangan bulat.")
    .positive("Jumlah harus lebih dari 0."),
  weight: optionalNonNegativeNumber,
  unitPrice: z.coerce
    .number({ message: "Harga satuan harus berupa angka." })
    .nonnegative("Harga satuan tidak boleh negatif."),
});

export const createSalesOrderSchema = z.object({
  customerId: z.string().uuid("Pelanggan tidak valid."),
  locationId: z.string().uuid("Lokasi gudang tidak valid."),
  saleDate: businessDateNotFutureSchema,
  items: z.array(lineItemSchema).min(1, "Minimal satu baris penjualan."),
});

export type CreateSalesOrderInput = z.infer<typeof createSalesOrderSchema>;
