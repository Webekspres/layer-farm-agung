import { z } from "zod";

export const POPULATION_MUTATION_TYPES = [
  "Mati",
  "Afkir",
  "Masuk",
  "Pindah",
] as const;

export type PopulationMutationType = (typeof POPULATION_MUTATION_TYPES)[number];

export const populationMutationSchema = z.object({
  cageId: z.string().uuid("Kandang tidak valid."),
  mutationType: z.enum(POPULATION_MUTATION_TYPES as unknown as [string, ...string[]], {
    message: `Jenis mutasi harus salah satu dari: ${POPULATION_MUTATION_TYPES.join(", ")}.`,
  }),
  quantity: z.coerce
    .number({ message: "Jumlah harus berupa angka." })
    .int("Jumlah harus bilangan bulat.")
    .positive("Jumlah mutasi harus lebih dari 0.")
    .max(100_000, "Jumlah mutasi melebihi batas wajar."),
  notes: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.string().max(500, "Catatan maksimal 500 karakter.").optional(),
  ),
  recordDate: z.coerce.date({ message: "Tanggal mutasi tidak valid." }),
});

export type PopulationMutationInput = z.infer<typeof populationMutationSchema>;
