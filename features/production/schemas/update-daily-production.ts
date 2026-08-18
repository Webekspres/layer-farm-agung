import { z } from "zod";
import {
  MAX_PRODUCTION_ENTRIES,
  productionEntrySchema,
} from "@/features/production/schemas/daily-production";
import { correctionMetaFields } from "@/features/production/schemas/correction-meta";

const weightField = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().min(0, "Berat tidak boleh negatif.").optional(),
);

export const updateDailyProductionSchema = z
  .object({
    entries: z
      .array(productionEntrySchema)
      .min(1, "Isi minimal satu klasifikasi telur.")
      .max(
        MAX_PRODUCTION_ENTRIES,
        `Maksimal ${MAX_PRODUCTION_ENTRIES} baris klasifikasi.`,
      ),
    /** Berat rata-rata telur (gram), opsional. */
    weight: weightField,
    ...correctionMetaFields,
  })
  .superRefine((data, ctx) => {
    const total = data.entries.reduce((sum, entry) => sum + entry.quantity, 0);
    if (total <= 0) {
      ctx.addIssue({
        code: "custom",
        message: "Isi minimal satu klasifikasi telur dengan jumlah lebih dari 0.",
        path: ["entries"],
      });
    }

    const uniqueIds = new Set(data.entries.map((entry) => entry.eggGradeId));
    if (uniqueIds.size !== data.entries.length) {
      ctx.addIssue({
        code: "custom",
        message: "Terdapat klasifikasi telur yang sama lebih dari sekali.",
        path: ["entries"],
      });
    }
  });

export type UpdateDailyProductionInput = z.infer<
  typeof updateDailyProductionSchema
>;
