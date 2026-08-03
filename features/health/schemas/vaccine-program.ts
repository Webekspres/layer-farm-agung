import { z } from "zod";

const optionalText = (max: number) =>
  z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.string().trim().max(max).optional(),
  );

export const vaccineProgramStepSchema = z.object({
  id: z.string().uuid().optional(),
  ageDays: z.coerce
    .number({ message: "Umur (hari) harus berupa angka." })
    .int("Umur harus bilangan bulat.")
    .min(0, "Umur tidak boleh negatif.")
    .max(3650, "Umur melebihi batas wajar."),
  itemId: z.string().uuid("Item vaksin/vitamin tidak valid."),
  pathogenLabel: optionalText(120),
  formulationType: optionalText(60),
  notes: optionalText(500),
  sortOrder: z.coerce.number().int().min(0).max(10_000).optional(),
});

export type VaccineProgramStepInput = z.infer<typeof vaccineProgramStepSchema>;

export const createVaccineProgramSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama program wajib diisi.")
    .max(120, "Nama program maksimal 120 karakter."),
  strainId: z.preprocess(
    (v) => {
      if (v === "" || v === null || v === undefined || v === "none") return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : v;
    },
    z.number().int().positive().nullable(),
  ),
  steps: z
    .array(vaccineProgramStepSchema)
    .min(1, "Minimal satu langkah program.")
    .max(200, "Terlalu banyak langkah."),
});

export type CreateVaccineProgramInput = z.infer<
  typeof createVaccineProgramSchema
>;

export const updateVaccineProgramSchema = createVaccineProgramSchema.extend({
  programId: z.string().uuid("Program tidak valid."),
  isActive: z.preprocess((v) => {
    if (v === true || v === "true" || v === "on" || v === "1") return true;
    if (v === false || v === "false" || v === "0") return false;
    return v;
  }, z.boolean()),
});

export type UpdateVaccineProgramInput = z.infer<
  typeof updateVaccineProgramSchema
>;

export const deactivateVaccineProgramSchema = z.object({
  programId: z.string().uuid("Program tidak valid."),
});

export type DeactivateVaccineProgramInput = z.infer<
  typeof deactivateVaccineProgramSchema
>;
