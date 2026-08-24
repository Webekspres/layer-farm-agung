import { z } from "zod";
import { businessDateNotFutureSchema } from "@/lib/business-date";

const goLiveDateSchema = businessDateNotFutureSchema
  .or(z.literal(""))
  .transform((value) => {
    if (value === "") return undefined;
    return value;
  });

export const createCycleSchema = z
  .object({
    cageId: z.string().uuid("Kandang tidak valid."),
    startDate: businessDateNotFutureSchema,
    /** Tanggal mulai pemakaian aplikasi (opsional). Null/empty = sama dengan startDate. */
    goLiveDate: goLiveDateSchema.optional(),
    initialPopulation: z.coerce
      .number()
      .int("Populasi awal harus berupa angka bulat.")
      .positive("Populasi awal minimal 1 ekor."),
  })
  .superRefine((data, ctx) => {
    if (
      data.goLiveDate &&
      data.goLiveDate.getTime() < data.startDate.getTime()
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["goLiveDate"],
        message:
          "Tanggal go-live tidak boleh sebelum tanggal chick-in (start_date).",
      });
    }
  });

export const closeCycleSchema = z.object({
  cycleId: z.string().uuid("Siklus tidak valid."),
  endDate: businessDateNotFutureSchema,
});
