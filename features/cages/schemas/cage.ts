import { z } from "zod";

const cageStatusValues = ["Active", "Inactive"] as const;

export const cageSchema = z.object({
  locationId: z.string().uuid("Pilih lokasi yang valid."),
  strainId: z.coerce.number().int().positive("Pilih strain yang valid."),
  name: z.string().trim().min(2, "Nama kandang minimal 2 karakter."),
  cageType: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  capacity: z.coerce
    .number()
    .int("Kapasitas harus bilangan bulat.")
    .positive("Kapasitas minimal 1."),
  status: z.enum(cageStatusValues).default("Active"),
  cycleStartDate: z
    .string()
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  initialPopulation: z.coerce
    .number()
    .int()
    .positive()
    .optional(),
}).superRefine((data, ctx) => {
  const hasDate = Boolean(data.cycleStartDate);
  const hasPop = data.initialPopulation !== undefined;

  if (hasDate !== hasPop) {
    ctx.addIssue({
      code: "custom",
      message:
        "Siklus awal: isi tanggal mulai dan populasi awal, atau kosongkan keduanya.",
      path: ["initialPopulation"],
    });
  }
});

export const updateCageSchema = cageSchema
  .omit({ cycleStartDate: true, initialPopulation: true })
  .extend({
    id: z.string().uuid(),
  });
