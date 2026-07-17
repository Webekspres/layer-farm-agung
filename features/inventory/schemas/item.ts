import { z } from "zod";
import { SAPRODI_ITEM_TYPES } from "@/features/inventory/lib/saprodi-item-types";

const saprodiItemTypeValues = [...SAPRODI_ITEM_TYPES] as [
  (typeof SAPRODI_ITEM_TYPES)[number],
  ...(typeof SAPRODI_ITEM_TYPES)[number][],
];

const baseItemFields = {
  name: z.string().trim().min(2, "Nama item minimal 2 karakter.").max(200),
  type: z.enum(saprodiItemTypeValues, {
    message: "Pilih tipe saprodi (bukan telur).",
  }),
  unit: z.string().trim().min(1, "Satuan wajib diisi.").max(30),
  minStockAlert: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce
      .number({ message: "Ambang batas harus berupa angka." })
      .min(0, "Ambang batas tidak boleh negatif.")
      .max(1_000_000)
      .optional(),
  ),
};

export const itemSchema = z.object(baseItemFields);

export const updateItemSchema = z.object({
  id: z.string().uuid(),
  ...baseItemFields,
});

export const stockAdjustmentSchema = z.object({
  itemId: z.string().uuid("Item tidak valid."),
  locationId: z.string().uuid("Lokasi tidak valid."),
  direction: z.enum(["IN", "OUT"], { message: "Pilih arah penyesuaian." }),
  quantity: z.coerce
    .number({ message: "Jumlah harus berupa angka." })
    .positive("Jumlah harus lebih dari 0.")
    .max(1_000_000, "Jumlah melebihi batas wajar."),
  note: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.string().trim().max(300, "Catatan maksimal 300 karakter.").optional(),
  ),
});

export type ItemInput = z.infer<typeof itemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>;
