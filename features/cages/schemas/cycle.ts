import { z } from "zod";
import { businessDateNotFutureSchema } from "@/lib/business-date";

export const createCycleSchema = z.object({
  cageId: z.string().uuid("Kandang tidak valid."),
  startDate: businessDateNotFutureSchema,
  initialPopulation: z.coerce
    .number()
    .int("Populasi awal harus berupa angka bulat.")
    .positive("Populasi awal minimal 1 ekor."),
});

export const closeCycleSchema = z.object({
  cycleId: z.string().uuid("Siklus tidak valid."),
  endDate: businessDateNotFutureSchema,
});
