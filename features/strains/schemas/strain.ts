import { z } from "zod";

export const strainSchema = z.object({
  name: z.string().trim().min(2, "Nama strain minimal 2 karakter."),
  description: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
});

export const updateStrainSchema = strainSchema.extend({
  id: z.coerce.number().int().positive(),
});
