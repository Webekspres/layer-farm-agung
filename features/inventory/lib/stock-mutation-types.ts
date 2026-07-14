/**
 * Central catalogue of `StockMutation.mutation_type` values.
 *
 * `StockMutation.mutation_type` is stored as free-text (like
 * `PopulationMutation.mutation_type`), so new sources of stock movement can be
 * added here without a database migration. The prefix encodes direction:
 * `IN_*` increases stock, `OUT_*` decreases it.
 */
export const StockMutationType = {
  /** Pembelian dari supplier (procurement / stok masuk manual). */
  IN_PURCHASE: "IN_PURCHASE",
  /** Telur bagus (TB) dari input produksi harian. */
  IN_HARVEST: "IN_HARVEST",
  /** Koreksi manual naik (penyesuaian stok). */
  IN_ADJUSTMENT: "IN_ADJUSTMENT",
  /** Konsumsi pakan dari input harian staff. */
  OUT_FEED: "OUT_FEED",
  /** Pemakaian obat/vitamin pada pengobatan. */
  OUT_MEDICAL: "OUT_MEDICAL",
  /** Koreksi manual turun (penyesuaian stok). */
  OUT_ADJUSTMENT: "OUT_ADJUSTMENT",
  // Direservasi untuk modul mendatang (jangan dipakai di task ini):
  /** Pemakaian vaksin/vitamin pada jadwal vaksinasi (Modul 13). */
  OUT_VACCINE: "OUT_VACCINE",
  /** Pengurangan telur saat penjualan ke pembeli (Modul 11). */
  OUT_SALES: "OUT_SALES",
} as const;

export type StockMutationType =
  (typeof StockMutationType)[keyof typeof StockMutationType];

/** Direction of a stock movement derived from a mutation type. */
export type StockDirection = "IN" | "OUT";

export function directionOf(mutationType: string): StockDirection {
  return mutationType.startsWith("OUT_") ? "OUT" : "IN";
}
