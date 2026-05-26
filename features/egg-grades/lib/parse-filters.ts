import type {
  EggGradeUsageFilter,
  EggGradesListFilters,
} from "@/features/egg-grades/types";

export function parseEggGradeListFilters(params: {
  q?: string;
  usage?: string;
}): EggGradesListFilters {
  const usage = params.usage;
  const validUsage: EggGradeUsageFilter[] = ["in_use", "unused"];
  const usageFilter: EggGradeUsageFilter =
    usage && validUsage.includes(usage as EggGradeUsageFilter)
      ? (usage as EggGradeUsageFilter)
      : "all";

  return {
    search: params.q,
    usage: usageFilter === "all" ? undefined : usageFilter,
  };
}
