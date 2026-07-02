import { StockMutationType } from "@/features/inventory/lib/stock-mutation-types";

/** Human-readable Indonesian label for each stock mutation type. */
export const MUTATION_TYPE_LABELS: Record<string, string> = {
  [StockMutationType.IN_PURCHASE]: "Pembelian",
  [StockMutationType.IN_HARVEST]: "Panen (TB)",
  [StockMutationType.IN_ADJUSTMENT]: "Penyesuaian (masuk)",
  [StockMutationType.OUT_FEED]: "Konsumsi pakan",
  [StockMutationType.OUT_MEDICAL]: "Pengobatan",
  [StockMutationType.OUT_ADJUSTMENT]: "Penyesuaian (keluar)",
  [StockMutationType.OUT_VACCINE]: "Vaksinasi",
  [StockMutationType.OUT_SALES]: "Penjualan",
};

export function mutationTypeLabel(type: string): string {
  return MUTATION_TYPE_LABELS[type] ?? type;
}
