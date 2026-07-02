import { z } from "zod";
import { APPLICATION_METHODS } from "@/features/production/schemas/medical-record";

export const updateMedicalRecordSchema = z.object({
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
  applicationMethod: z.enum(
    APPLICATION_METHODS as unknown as [string, ...string[]],
    {
      message: `Metode pemberian harus salah satu dari: ${APPLICATION_METHODS.join(", ")}.`,
    },
  ),
  treatmentNotes: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.string().max(1000, "Catatan maksimal 1000 karakter.").optional(),
  ),
  // Only meaningful when the original record has an item linked; the service
  // rejects this if the record has no item_id. The linked item itself is not
  // editable — only how much of it was used.
  quantityUsed: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.coerce
      .number({ message: "Jumlah pemakaian harus berupa angka." })
      .positive("Jumlah pemakaian harus lebih dari 0.")
      .max(100_000, "Jumlah pemakaian melebihi batas wajar.")
      .optional(),
  ),
});

export type UpdateMedicalRecordInput = z.infer<
  typeof updateMedicalRecordSchema
>;
