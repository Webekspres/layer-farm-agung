import { z } from "zod";
import { businessDateSchema } from "@/lib/business-date";
import { idempotentPostFields } from "@/features/production/lib/client-mutation-id";

const notesSchema = z.preprocess(
  (v) => (v === "" || v === null ? undefined : v),
  z.string().trim().max(500, "Catatan maksimal 500 karakter.").optional(),
);

export const createVaccineScheduleSchema = z.object({
  cageId: z.string().uuid("Kandang tidak valid."),
  itemId: z.string().uuid("Item vaksin tidak valid."),
  // Schedules are set for a future date — no "not future" restriction here.
  scheduledDate: businessDateSchema,
  notes: notesSchema,
});

export type CreateVaccineScheduleInput = z.infer<
  typeof createVaccineScheduleSchema
>;

export const completeVaccinationSchema = z.object({
  scheduleId: z.string().uuid("Jadwal vaksinasi tidak valid."),
  quantityUsed: z.coerce
    .number({ message: "Jumlah pemakaian harus berupa angka." })
    .positive("Jumlah pemakaian harus lebih dari 0.")
    .max(100_000, "Jumlah pemakaian melebihi batas wajar."),
  notes: notesSchema,
  ...idempotentPostFields,
});

export type CompleteVaccinationInput = z.infer<
  typeof completeVaccinationSchema
>;

export const cancelVaccineScheduleSchema = z.object({
  scheduleId: z.string().uuid("Jadwal vaksinasi tidak valid."),
});

export type CancelVaccineScheduleInput = z.infer<
  typeof cancelVaccineScheduleSchema
>;
