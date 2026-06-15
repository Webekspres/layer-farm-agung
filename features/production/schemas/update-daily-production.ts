import { z } from "zod";
import { MAX_EGG_COUNT_PER_ENTRY } from "@/features/production/schemas/daily-production";

const eggCountField = z.coerce
  .number()
  .int("Jumlah telur harus bilangan bulat.")
  .min(0, "Jumlah telur tidak boleh negatif.")
  .max(
    MAX_EGG_COUNT_PER_ENTRY,
    `Maksimal ${MAX_EGG_COUNT_PER_ENTRY.toLocaleString("id-ID")} butir per field.`,
  );

export const updateDailyProductionSchema = z
  .object({
    tb: eggCountField.default(0),
    tr: eggCountField.default(0),
    tp: eggCountField.default(0),
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

export type UpdateDailyProductionInput = z.infer<
  typeof updateDailyProductionSchema
>;
