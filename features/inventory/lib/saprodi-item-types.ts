import { ItemType } from "@/generated/prisma/enums";

/**
 * Saprodi = operational consumables (Modul 8). Egg is sellable output
 * (Egg Ledger) — shared stock engine, separate product domain.
 * @see docs/egg-ledger-architecture.md
 */
export const SAPRODI_ITEM_TYPES = [
  ItemType.Feed,
  ItemType.Medicine,
  ItemType.Vitamin,
  ItemType.Vaccine,
  ItemType.Other,
] as const;

export type SaprodiItemType = (typeof SAPRODI_ITEM_TYPES)[number];

export const SAPRODI_ITEM_TYPE_VALUES = [...SAPRODI_ITEM_TYPES] as ItemType[];

export const EGG_LEDGER_MANAGED_MESSAGE =
  "Stok telur dikelola lewat panen (produksi) dan penjualan, bukan inventori saprodi.";

export function isSaprodiItemType(type: string): type is SaprodiItemType {
  return (SAPRODI_ITEM_TYPES as readonly string[]).includes(type);
}

export function isEggLedgerItemType(type: string): boolean {
  return type === ItemType.Egg;
}
