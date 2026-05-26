import { z } from "zod";

export const eggGradeSchema = z.object({
  name: z.string().trim().min(2, "Nama grade minimal 2 karakter."),
  description: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
});

export const updateEggGradeSchema = eggGradeSchema.extend({
  id: z.coerce.number().int().positive(),
});
