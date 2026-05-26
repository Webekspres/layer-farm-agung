export type EggGradeUsageFilter = "all" | "in_use" | "unused";

export type EggGradesListFilters = {
  search?: string;
  usage?: EggGradeUsageFilter;
};

export type EggGradeListItem = {
  id: number;
  name: string;
  description: string | null;
  usageCount: number;
};
