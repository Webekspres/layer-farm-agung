import { z } from "zod";
import { operationalBusinessDateSchema } from "@/lib/business-date";
import { idempotentPostFields } from "@/features/production/lib/client-mutation-id";

export const APPLICATION_METHODS = [
  "Minum",
  "Suntik",
  "Semprot",
  "Tetes",
  "Campur Pakan",
] as const;

export type ApplicationMethod = (typeof APPLICATION_METHODS)[number];

export const medicalRecordSchema = z.object({
  cageId: z.string().uuid("Kandang tidak valid."),
  indication: z
    .string()
    .min(3, "Indikasi/gejala minimal 3 karakter.")
    .max(500, "Indikasi maksimal 500 karakter."),
  sickPopulation: z.coerce
    .number({ message: "Populasi sakit harus berupa angka." })
    .int("Harus bilangan bulat.")
    .min(0, "Tidak boleh negatif.")
    .default(0),
  mortalityCount: z.coerce
    .number({ message: "Jumlah kematian harus berupa angka." })
    .int("Harus bilangan bulat.")
    .min(0, "Tidak boleh negatif.")
    .default(0),
  medicineName: z
    .string()
    .min(1, "Nama obat wajib diisi.")
    .max(200, "Nama obat maksimal 200 karakter."),
  dosageAndDuration: z
    .string()
    .min(1, "Dosis dan durasi wajib diisi.")
    .max(300, "Dosis dan durasi maksimal 300 karakter."),
  applicationMethod: z.enum(APPLICATION_METHODS as unknown as [string, ...string[]], {
    message: `Metode pemberian harus salah satu dari: ${APPLICATION_METHODS.join(", ")}.`,
  }),
  treatmentNotes: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.string().max(1000, "Catatan maksimal 1000 karakter.").optional(),
  ),
  treatmentDate: operationalBusinessDateSchema,
  // Optional link to an inventory item (Medicine/Vitamin). When present, its
  // stock is deducted; when absent, the record is free-text only.
  itemId: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.string().uuid("Item obat/vitamin tidak valid.").optional(),
  ),
  quantityUsed: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.coerce
      .number({ message: "Jumlah pemakaian harus berupa angka." })
      .positive("Jumlah pemakaian harus lebih dari 0.")
      .max(100_000, "Jumlah pemakaian melebihi batas wajar.")
      .optional(),
  ),
  ...idempotentPostFields,
}).refine(
  (data) => (data.itemId ? data.quantityUsed != null : true),
  {
    message: "Isi jumlah pemakaian bila memilih item obat/vitamin.",
    path: ["quantityUsed"],
  },
);

export type MedicalRecordInput = z.infer<typeof medicalRecordSchema>;
