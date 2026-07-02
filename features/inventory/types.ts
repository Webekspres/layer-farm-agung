import type { ItemType } from "@/generated/prisma/enums";

export type InventoryListFilters = {
  search?: string;
  type?: ItemType;
};

export type ItemListItem = {
  id: string;
  name: string;
  type: ItemType;
  unit: string;
  minStockAlert: number | null;
  totalQuantity: number;
  lowStock: boolean;
  createdAt: string;
};

export type StockByLocation = {
  locationId: string;
  locationName: string;
  quantity: number;
};

export type StockMutationEntry = {
  id: string;
  mutationType: string;
  direction: "IN" | "OUT";
  quantity: number;
  referenceId: string | null;
  mutationDate: string;
};

export type ItemDetail = {
  id: string;
  name: string;
  type: ItemType;
  unit: string;
  minStockAlert: number | null;
  totalQuantity: number;
  lowStock: boolean;
  stockByLocation: StockByLocation[];
  mutations: StockMutationEntry[];
};
