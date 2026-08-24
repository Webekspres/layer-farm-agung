import { EggMovementType } from "@/features/eggs/lib/egg-mutation-types";

/** Human-readable Indonesian label for each egg movement type. */
export const EGG_MUTATION_TYPE_LABELS: Record<string, string> = {
  [EggMovementType.IN_HARVEST]: "Panen",
  [EggMovementType.IN_ADJUSTMENT]: "Koreksi (naik)",
  [EggMovementType.OUT_ADJUSTMENT]: "Koreksi (turun)",
  [EggMovementType.OUT_SALES]: "Penjualan",
};

export function eggMutationTypeLabel(type: string): string {
  return EGG_MUTATION_TYPE_LABELS[type] ?? type;
}