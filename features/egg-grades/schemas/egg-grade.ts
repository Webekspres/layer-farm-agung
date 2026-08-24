import { z } from "zod";

const codeField = z
  .string()
  .trim()
  .toUpperCase()
  .optional()
  .transform((v) => (v === "" ? undefined : v))
  .refine(
    (v) => v === undefined || /^[A-Z0-9]{1,10}$/.test(v),
    "Kode maksimal 10 karakter (huruf atau angka, tanpa spasi).",
  );

const checkboxField = z.preprocess(
  (v) => v === "on" || v === "true" || v === true,
  z.boolean(),
);

export const eggGradeSchema = z.object({
  name: z.string().trim().min(1, "Nama grade wajib diisi."),
  code: codeField,
  description: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  isActive: checkboxField,
  sortOrder: z.coerce.number().int().min(0, "Urutan tidak boleh negatif."),
});

export const updateEggGradeSchema = eggGradeSchema.extend({
  id: z.coerce.number().int().positive(),
});
