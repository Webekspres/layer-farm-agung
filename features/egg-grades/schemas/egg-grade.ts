import { z } from "zod";

export const eggGradeSchema = z.object({
  name: z.string().trim().min(1, "Nama grade wajib diisi."),
  description: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
});

export const updateEggGradeSchema = eggGradeSchema.extend({
  id: z.coerce.number().int().positive(),
});
