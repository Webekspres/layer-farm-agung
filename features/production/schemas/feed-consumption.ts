import { z } from "zod";

export const FEED_MUTATION_TYPES = ["Pakan", "Feed"] as const;

export const feedConsumptionSchema = z.object({
  cageId: z.string().uuid("Kandang tidak valid."),
  itemId: z.string().uuid("Item pakan tidak valid."),
  recordDate: z.coerce.date({ message: "Tanggal konsumsi tidak valid." }),
  quantity: z.coerce
    .number({ message: "Jumlah harus berupa angka." })
    .positive("Jumlah pakan harus lebih dari 0.")
    .max(100_000, "Jumlah pakan melebihi batas wajar (100.000 kg)."),
  notes: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.string().max(500, "Catatan maksimal 500 karakter.").optional(),
  ),
});

export type FeedConsumptionInput = z.infer<typeof feedConsumptionSchema>;
