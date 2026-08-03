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

export const productionTargetSchema = z.object({
  strainId: z.coerce.number().int().positive("Strain tidak valid."),
  ageInWeeks: z.coerce
    .number()
    .int("Umur harus bilangan bulat.")
    .positive("Umur minimal 1 minggu."),
  targetHdp: z.coerce
    .number()
    .min(0, "Target HDP minimal 0%.")
    .max(100, "Target HDP maksimal 100%."),
  targetFcr: z.coerce
    .number()
    .positive("Target FCR harus bernilai positif."),
});

export const updateProductionTargetSchema = productionTargetSchema.extend({
  id: z.coerce.number().int().positive("Target tidak valid."),
});

export const deleteProductionTargetSchema = z.object({
  id: z.coerce.number().int().positive(),
  strainId: z.coerce.number().int().positive(),
});
