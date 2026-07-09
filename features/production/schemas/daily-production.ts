import { z } from "zod";
import { operationalBusinessDateSchema } from "@/lib/business-date";
import { idempotentPostFields } from "@/features/production/lib/client-mutation-id";

export const MAX_EGG_COUNT_PER_ENTRY = 10_000;

const eggCountField = z.coerce
  .number()
  .int("Jumlah telur harus bilangan bulat.")
  .min(0, "Jumlah telur tidak boleh negatif.")
  .max(
    MAX_EGG_COUNT_PER_ENTRY,
    `Maksimal ${MAX_EGG_COUNT_PER_ENTRY.toLocaleString("id-ID")} butir per field.`,
  );

const weightField = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().min(0, "Berat tidak boleh negatif.").optional(),
);

export const dailyProductionSchema = z
  .object({
    cageId: z.string().uuid("Kandang tidak valid."),
    recordDate: operationalBusinessDateSchema,
    tb: eggCountField.default(0),
    tr: eggCountField.default(0),
    tp: eggCountField.default(0),
    weight: weightField,
    ...idempotentPostFields,
  })
  .superRefine((data, ctx) => {
    const total = data.tb + data.tr + data.tp;
    if (total <= 0) {
      ctx.addIssue({
        code: "custom",
        message: "Isi minimal satu dari TB, TR, atau TP.",
        path: ["tb"],
      });
    }
  });

export type DailyProductionInput = z.infer<typeof dailyProductionSchema>;
