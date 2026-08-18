import { z } from "zod";
import { operationalBusinessDateSchema } from "@/lib/business-date";
import { idempotentPostFields } from "@/features/production/lib/client-mutation-id";

export const MAX_EGG_COUNT_PER_ENTRY = 10_000;
export const MAX_PRODUCTION_ENTRIES = 20;

export const productionEntrySchema = z.object({
  eggGradeId: z
    .number({ message: "Klasifikasi telur tidak valid." })
    .int("Klasifikasi telur tidak valid.")
    .positive("Klasifikasi telur tidak valid."),
  quantity: z.coerce
    .number()
    .int("Jumlah telur harus bilangan bulat.")
    .min(1, "Jumlah telur minimal 1 butir per baris.")
    .max(
      MAX_EGG_COUNT_PER_ENTRY,
      `Maksimal ${MAX_EGG_COUNT_PER_ENTRY.toLocaleString("id-ID")} butir per baris.`,
    ),
});

export type ProductionEntryInput = z.infer<typeof productionEntrySchema>;

const weightField = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce
    .number()
    .min(0, "Berat tidak boleh negatif.")
    .optional(),
);

export const dailyProductionSchema = z
  .object({
    cageId: z.string().uuid("Kandang tidak valid."),
    recordDate: operationalBusinessDateSchema,
    entries: z
      .array(productionEntrySchema)
      .min(1, "Isi minimal satu klasifikasi telur.")
      .max(
        MAX_PRODUCTION_ENTRIES,
        `Maksimal ${MAX_PRODUCTION_ENTRIES} baris klasifikasi.`,
      ),
    /** Berat rata-rata telur (gram), opsional — dipakai utk Egg Mass pada FCR. */
    weight: weightField,
    ...idempotentPostFields,
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

export type DailyProductionInput = z.infer<typeof dailyProductionSchema>;
