import { z } from "zod";

export const createCycleSchema = z.object({
  cageId: z.string().uuid("Kandang tidak valid."),
  startDate: z.coerce
    .date({
      message: "Pilih tanggal mulai yang valid.",
    })
    .refine((date) => {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      return date <= today;
    }, "Tanggal mulai tidak boleh di masa depan."),
  initialPopulation: z.coerce
    .number()
    .int("Populasi awal harus berupa angka bulat.")
    .positive("Populasi awal minimal 1 ekor."),
});

export const closeCycleSchema = z.object({
  cycleId: z.string().uuid("Siklus tidak valid."),
  endDate: z.coerce.date({
    message: "Pilih tanggal selesai yang valid.",
  }),
});
