export type StrainUsageFilter = "all" | "in_use" | "unused";

export type StrainsListFilters = {
  search?: string;
  usage?: StrainUsageFilter;
};

export type StrainListItem = {
  id: number;
  name: string;
  description: string | null;
  cageCount: number;
  targetCount: number;
};
