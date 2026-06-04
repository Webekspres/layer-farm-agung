import { z } from "zod";

export const MAX_EGG_COUNT_PER_ENTRY = 10_000;

const quantityField = z.coerce
  .number()
  .int("Jumlah telur layak harus bilangan bulat.")
  .min(0, "Jumlah telur layak tidak boleh negatif.")
  .max(
    MAX_EGG_COUNT_PER_ENTRY,
    `Maksimal ${MAX_EGG_COUNT_PER_ENTRY.toLocaleString("id-ID")} butir per entri.`,
  );

const eggCrackField = z.coerce
  .number()
  .int("Jumlah telur pecah harus bilangan bulat.")
  .min(0, "Jumlah telur pecah tidak boleh negatif.")
  .max(
    MAX_EGG_COUNT_PER_ENTRY,
    `Maksimal ${MAX_EGG_COUNT_PER_ENTRY.toLocaleString("id-ID")} butir per entri.`,
  );

const weightField = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().min(0, "Berat tidak boleh negatif.").optional(),
);

export const dailyProductionSchema = z
  .object({
    cageId: z.string().uuid("Kandang tidak valid."),
    eggGradeId: z.coerce
      .number()
      .int()
      .positive("Pilih grade telur."),
    recordDate: z.coerce.date({
      message: "Tanggal panen tidak valid.",
    }),
    quantity: quantityField,
    eggCrack: eggCrackField.default(0),
    weight: weightField,
  })
  .superRefine((data, ctx) => {
    const total = data.quantity + data.eggCrack;
    if (total <= 0) {
      ctx.addIssue({
        code: "custom",
        message: "Isi jumlah telur layak atau telur pecah minimal 1 butir.",
        path: ["quantity"],
      });
    }
  });

export type DailyProductionInput = z.infer<typeof dailyProductionSchema>;
