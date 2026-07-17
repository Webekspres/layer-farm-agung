import { z } from "zod";
import { operationalBusinessDateSchema } from "@/lib/business-date";
import { idempotentPostFields } from "@/features/production/lib/client-mutation-id";

export const POPULATION_MUTATION_TYPES = [
  "Mati",
  "Afkir",
  "Masuk",
  "Pindah",
] as const;

export type PopulationMutationType = (typeof POPULATION_MUTATION_TYPES)[number];

export const populationMutationSchema = z
  .object({
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
    recordDate: operationalBusinessDateSchema,
    targetCageId: z.preprocess(
      (v) => (v === "" || v === null ? undefined : v),
      z.string().uuid("Kandang tujuan tidak valid.").optional(),
    ),
    ...idempotentPostFields,
  })
  .refine(
    (data) => data.mutationType !== "Pindah" || Boolean(data.targetCageId),
    {
      message: "Kandang tujuan wajib diisi untuk mutasi Pindah.",
      path: ["targetCageId"],
    },
  )
  .refine(
    (data) =>
      data.mutationType !== "Pindah" || data.targetCageId !== data.cageId,
    {
      message: "Kandang tujuan harus berbeda dari kandang asal.",
      path: ["targetCageId"],
    },
  );

export type PopulationMutationInput = z.infer<typeof populationMutationSchema>;
