import { z } from "zod";

const cageStatusValues = ["Active", "Inactive"] as const;

const cageBaseSchema = z.object({
  locationId: z.uuid("Pilih lokasi yang valid."),
  strainId: z.coerce.number().int().positive("Pilih strain yang valid."),
  name: z.string().trim().min(2, "Nama kandang minimal 2 karakter."),
  cageType: z
    .enum([
      "Closed House (Battery)",
      "Open House (Battery)",
      "Open House (Floor/Postal)",
      "Lainnya",
    ])
    .optional()
    .or(z.literal("")),
  cageTypeCustom: z.string().trim().optional(),
  capacity: z.coerce
    .number()
    .int("Kapasitas harus bilangan bulat.")
    .positive("Kapasitas minimal 1."),
  status: z.enum(cageStatusValues).default("Active"),
  cycleStartDate: z
    .string()
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  initialPopulation: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.coerce.number().int().positive().optional(),
  ),
});

function refineCycleFields(
  data: z.infer<typeof cageBaseSchema>,
  ctx: z.RefinementCtx,
) {
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
}

function refineCageTypeFields(
  data: Pick<z.infer<typeof cageBaseSchema>, "cageType" | "cageTypeCustom">,
  ctx: z.RefinementCtx,
) {
  if (data.cageType === "Lainnya") {
    if (!data.cageTypeCustom || data.cageTypeCustom.trim() === "") {
      ctx.addIssue({
        code: "custom",
        message: "Masukkan tipe kustom Anda.",
        path: ["cageTypeCustom"],
      });
    }
  }
}

export const cageSchema = cageBaseSchema
  .superRefine(refineCycleFields)
  .superRefine(refineCageTypeFields);

export const updateCageSchema = cageBaseSchema
  .omit({ cycleStartDate: true, initialPopulation: true })
  .extend({
    id: z.string().uuid(),
  })
  .superRefine(refineCageTypeFields);
