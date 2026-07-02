import { ItemType } from "@/generated/prisma/enums";

/** ItemType → client-facing Indonesian label (category + purpose). */
export const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  [ItemType.Feed]: "Pakan",
  [ItemType.Medicine]: "Obat",
  [ItemType.Vitamin]: "Vitamin",
  [ItemType.Vaccine]: "Vaksin",
  [ItemType.Egg]: "Telur",
  [ItemType.Other]: "Lainnya",
};

export const ITEM_TYPE_VALUES = Object.values(ItemType) as ItemType[];

export function itemTypeLabel(type: string): string {
  return ITEM_TYPE_LABELS[type as ItemType] ?? type;
}
