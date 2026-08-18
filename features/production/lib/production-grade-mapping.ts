import type { ProductionEntryInput } from "@/features/production/schemas/daily-production";

/** Kode grade yang di-mapping ke kolom denormalisasi di DailyProduction. */
export const PRODUCTION_BUCKET_CODES = ["TB", "TR", "TP"] as const;

export type ProductionBucket = "tb" | "tr" | "tp";

export type ProductionGradeLike = {
  id: number;
  code: string | null;
  is_active: boolean;
};

/** Mapping kode grade (TB/TR/TP) ke kolom bucket legacy. Grade lain → null. */
export function bucketFromCode(code: string | null): ProductionBucket | null {
  if (code === "TB") return "tb";
  if (code === "TR") return "tr";
  if (code === "TP") return "tp";
  return null;
}

export type ResolvedProductionBuckets = {
  tb: number;
  tr: number;
  tp: number;
  /** eggGradeId → bucket (hanya utk grade berkode TB/TR/TP). */
  bucketByGradeId: Map<number, ProductionBucket>;
  total: number;
};

export type ResolveBucketsResult =
  | { ok: true; buckets: ResolvedProductionBuckets }
  | { ok: false; error: string };

/**
 * Validates entries against the grade master (harus ada + aktif) dan
 * meng-agregasi jumlah per bucket legacy (TB/TR/TP) berdasarkan kode grade.
 * Grade tanpa kode tetap tercatat di DailyProductionItem (ikut total), tapi
 * tidak masuk kolom bucket.
 */
export function resolveProductionBuckets(
  entries: ProductionEntryInput[],
  grades: ProductionGradeLike[],
): ResolveBucketsResult {
  const gradeById = new Map(grades.map((grade) => [grade.id, grade]));

  for (const entry of entries) {
    const grade = gradeById.get(entry.eggGradeId);
    if (!grade || !grade.is_active) {
      return {
        ok: false,
        error: "Terdapat klasifikasi telur yang tidak valid atau nonaktif.",
      };
    }
  }

  const buckets: ResolvedProductionBuckets = {
    tb: 0,
    tr: 0,
    tp: 0,
    bucketByGradeId: new Map(),
    total: 0,
  };

  for (const entry of entries) {
    const grade = gradeById.get(entry.eggGradeId)!;
    const bucket = bucketFromCode(grade.code);
    buckets.total += entry.quantity;
    if (bucket) {
      buckets[bucket] += entry.quantity;
      buckets.bucketByGradeId.set(entry.eggGradeId, bucket);
    }
  }

  return { ok: true, buckets };
}

/** Egg Mass (kg) = Total Butir × Berat Rata-rata (gram) ÷ 1000. */
export function computeEggMassKg(
  totalEggs: number,
  avgWeightGrams: number,
): number {
  return (totalEggs * avgWeightGrams) / 1000;
}
