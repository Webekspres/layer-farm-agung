import type { StrainUsageFilter, StrainsListFilters } from "@/features/strains/types";

export function parseStrainListFilters(params: {
  q?: string;
  usage?: string;
}): StrainsListFilters {
  const usage = params.usage;
  const validUsage: StrainUsageFilter[] = ["in_use", "unused"];
  const usageFilter: StrainUsageFilter =
    usage && validUsage.includes(usage as StrainUsageFilter)
      ? (usage as StrainUsageFilter)
      : "all";

  return {
    search: params.q,
    usage: usageFilter === "all" ? undefined : usageFilter,
  };
}
