export type EggGradeUsageFilter = "all" | "in_use" | "unused";

export type EggGradesListFilters = {
  search?: string;
  usage?: EggGradeUsageFilter;
};

export type EggGradeListItem = {
  id: number;
  name: string;
  /** Kode stabil (TB/TR/TP) utk mapping bucket produksi; null utk grade non-produksi. */
  code: string | null;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  usageCount: number;
};
