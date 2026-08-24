import { z } from "zod";
import { correctionMetaFields } from "@/features/production/schemas/correction-meta";

export const updateFeedConsumptionSchema = z.object({
  quantity: z.coerce
    .number({ message: "Jumlah harus berupa angka." })
    .min(0, "Jumlah pakan tidak boleh negatif.")
    .max(100_000, "Jumlah pakan melebihi batas wajar (100.000 kg)."),
  notes: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.string().max(500, "Catatan maksimal 500 karakter.").optional(),
  ),
  ...correctionMetaFields,
});

export type UpdateFeedConsumptionInput = z.infer<
  typeof updateFeedConsumptionSchema
>;
