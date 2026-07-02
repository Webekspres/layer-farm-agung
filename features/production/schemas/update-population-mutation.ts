import { z } from "zod";
import { POPULATION_MUTATION_TYPES } from "@/features/production/schemas/population-mutation";

export const updatePopulationMutationSchema = z.object({
  mutationType: z.enum(
    POPULATION_MUTATION_TYPES as unknown as [string, ...string[]],
    {
      message: `Jenis mutasi harus salah satu dari: ${POPULATION_MUTATION_TYPES.join(", ")}.`,
    },
  ),
  quantity: z.coerce
    .number({ message: "Jumlah harus berupa angka." })
    .int("Jumlah harus bilangan bulat.")
    .positive("Jumlah mutasi harus lebih dari 0.")
    .max(100_000, "Jumlah mutasi melebihi batas wajar."),
  notes: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.string().max(500, "Catatan maksimal 500 karakter.").optional(),
  ),
});

export type UpdatePopulationMutationInput = z.infer<
  typeof updatePopulationMutationSchema
>;
