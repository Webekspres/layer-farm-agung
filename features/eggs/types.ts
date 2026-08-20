export type EggStockByLocation = {
  locationId: string;
  locationName: string;
  quantity: number;
};

/** Baris stok telur per grade di tab Stok Telur. */
export type EggStockGradeRow = {
  gradeId: number;
  code: string | null;
  name: string;
  sortOrder: number;
  totalQuantity: number;
};

export type EggMovementEntry = {
  id: string;
  mutationType: string;
  direction: "IN" | "OUT";
  quantity: number;
  referenceId: string | null;
  mutationDate: string;
  locationName: string;
};

export type EggStockGradeDetail = {
  gradeId: number;
  code: string | null;
  name: string;
  totalQuantity: number;
  stockByLocation: EggStockByLocation[];
  movements: EggMovementEntry[];
};