import { z } from "zod";

export const updateFeedConsumptionSchema = z.object({
  quantity: z.coerce
    .number({ message: "Jumlah harus berupa angka." })
    .positive("Jumlah pakan harus lebih dari 0.")
    .max(100_000, "Jumlah pakan melebihi batas wajar (100.000 kg)."),
  notes: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.string().max(500, "Catatan maksimal 500 karakter.").optional(),
  ),
});

export type UpdateFeedConsumptionInput = z.infer<
  typeof updateFeedConsumptionSchema
>;
