/**
 * Central catalogue of `EggMovement.mutation_type` values.
 *
 * Like `StockMutation.mutation_type`, this is stored as free-text so new
 * sources of egg movement can be added without a migration. The prefix encodes
 * direction: `IN_*` increases stock, `OUT_*` decreases it.
 */
export const EggMovementType = {
  /** Telur hasil panen dari input produksi harian (per grade). */
  IN_HARVEST: "IN_HARVEST",
  /** Koreksi produksi naik (penyesuaian stok per grade). */
  IN_ADJUSTMENT: "IN_ADJUSTMENT",
  /** Koreksi produksi turun / pembatalan panen (rekon sisa produksi). */
  OUT_ADJUSTMENT: "OUT_ADJUSTMENT",
  /** Pengurangan telur per grade saat penjualan ke pembeli. */
  OUT_SALES: "OUT_SALES",
} as const;

export type EggMovementType =
  (typeof EggMovementType)[keyof typeof EggMovementType];

export type EggDirection = "IN" | "OUT";

export function eggDirectionOf(mutationType: string): EggDirection {
  return mutationType.startsWith("OUT_") ? "OUT" : "IN";
}