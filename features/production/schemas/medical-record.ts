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

/** Sentinel values for explicit "no treatment today" (GAP-017 reported none). */
export const MEDICAL_NONE_REPORT = {
  indication: "Tidak ada pengobatan",
  medicineName: "Tidak ada pengobatan",
  dosageAndDuration: "-",
  applicationMethod: "Minum" as const,
  sickPopulation: 0,
  mortalityCount: 0,
} as const;

export function isMedicalNoneReport(row: {
  medicineName?: string | null;
  indication?: string | null;
}): boolean {
  return (
    row.medicineName === MEDICAL_NONE_REPORT.medicineName ||
    row.indication === MEDICAL_NONE_REPORT.indication
  );
}

const medicalRecordBaseSchema = z
  .object({
    cageId: z.string().uuid("Kandang tidak valid."),
    noneReported: z.boolean().optional(),
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
    treatmentDate: operationalBusinessDateSchema,
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
  })
  .refine((data) => (data.itemId ? data.quantityUsed != null : true), {
    message: "Isi jumlah pemakaian bila memilih item obat/vitamin.",
    path: ["quantityUsed"],
  });

/**
 * Accepts either a full treatment payload, or `{ noneReported: true, cageId, treatmentDate }`
 * which is normalized to sentinel values (row exists = reported none).
 */
export const medicalRecordSchema = z.preprocess((raw) => {
  if (
    raw &&
    typeof raw === "object" &&
    (raw as { noneReported?: boolean }).noneReported === true
  ) {
    const body = raw as Record<string, unknown>;
    return {
      ...body,
      indication: MEDICAL_NONE_REPORT.indication,
      medicineName: MEDICAL_NONE_REPORT.medicineName,
      dosageAndDuration: MEDICAL_NONE_REPORT.dosageAndDuration,
      applicationMethod: MEDICAL_NONE_REPORT.applicationMethod,
      sickPopulation: MEDICAL_NONE_REPORT.sickPopulation,
      mortalityCount: MEDICAL_NONE_REPORT.mortalityCount,
      itemId: undefined,
      quantityUsed: undefined,
      treatmentNotes:
        typeof body.treatmentNotes === "string" && body.treatmentNotes.trim()
          ? body.treatmentNotes
          : "Tidak ada pengobatan hari ini.",
    };
  }
  return raw;
}, medicalRecordBaseSchema);

export type MedicalRecordInput = z.infer<typeof medicalRecordBaseSchema>;
