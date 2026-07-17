import { z } from "zod";
import { businessDateNotFutureSchema } from "@/lib/business-date";

const lineItemSchema = z.object({
  itemId: z.string().uuid("Item tidak valid."),
  quantity: z.coerce
    .number({ message: "Jumlah harus berupa angka." })
    .positive("Jumlah harus lebih dari 0."),
  unitPrice: z.coerce
    .number({ message: "Harga satuan harus berupa angka." })
    .nonnegative("Harga satuan tidak boleh negatif."),
});

export const createPurchaseOrderSchema = z.object({
  vendorId: z.string().uuid("Vendor tidak valid."),
  orderDate: businessDateNotFutureSchema,
  items: z
    .array(lineItemSchema)
    .min(1, "Minimal satu barang pada pesanan."),
});

export type CreatePurchaseOrderInput = z.infer<typeof createPurchaseOrderSchema>;

const receiveLineItemSchema = z.object({
  itemId: z.string().uuid("Item tidak valid."),
  quantity: z.coerce
    .number({ message: "Jumlah harus berupa angka." })
    .nonnegative("Jumlah tidak boleh negatif."),
});

export const receivePurchaseOrderSchema = z.object({
  poId: z.string().uuid("Pesanan tidak valid."),
  locationId: z.string().uuid("Lokasi tidak valid."),
  /** Omit to receive all remaining quantity on every line. */
  items: z.array(receiveLineItemSchema).optional(),
});

export type ReceivePurchaseOrderInput = z.infer<typeof receivePurchaseOrderSchema>;

export const cancelPurchaseOrderSchema = z.object({
  poId: z.string().uuid("Pesanan tidak valid."),
});

export type CancelPurchaseOrderInput = z.infer<typeof cancelPurchaseOrderSchema>;
