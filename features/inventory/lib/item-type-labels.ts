import { ItemType } from "@/generated/prisma/enums";
import { SAPRODI_ITEM_TYPE_VALUES } from "@/features/inventory/lib/saprodi-item-types";

/** ItemType → client-facing Indonesian label (category + purpose). */
export const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  [ItemType.Feed]: "Pakan",
  [ItemType.Medicine]: "Obat",
  [ItemType.Vitamin]: "Vitamin",
  [ItemType.Vaccine]: "Vaksin",
  [ItemType.Egg]: "Telur",
  [ItemType.Other]: "Lainnya",
};

/**
 * Types offered in Inventori (Saprodi) UI — excludes Egg (Egg Ledger).
 * Prefer this over Object.values(ItemType) for inventori forms/filters.
 */
export const ITEM_TYPE_VALUES = SAPRODI_ITEM_TYPE_VALUES;

/** All ItemType values (including Egg) — labels / mutation views. */
export const ALL_ITEM_TYPE_VALUES = Object.values(ItemType) as ItemType[];

export function itemTypeLabel(type: string): string {
  return ITEM_TYPE_LABELS[type as ItemType] ?? type;
}
