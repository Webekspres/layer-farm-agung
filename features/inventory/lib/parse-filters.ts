import type { InventoryListFilters } from "@/features/inventory/types";
import { ITEM_TYPE_VALUES } from "@/features/inventory/lib/item-type-labels";
import type { ItemType } from "@/generated/prisma/enums";

export function parseInventoryListFilters(params: {
  q?: string;
  type?: string;
}): InventoryListFilters {
  const type =
    params.type && (ITEM_TYPE_VALUES as string[]).includes(params.type)
      ? (params.type as ItemType)
      : undefined;

  return {
    search: params.q,
    type,
  };
}
