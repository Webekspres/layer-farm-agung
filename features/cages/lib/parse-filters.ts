import type { CageStatusFilter, CagesListFilters } from "@/features/cages/types";

export function parseCageListFilters(params: {
  q?: string;
  location?: string;
  strain?: string;
  status?: string;
}): CagesListFilters {
  const status = params.status;
  const validStatus: CageStatusFilter[] = ["Active", "Inactive", "all"];
  const statusFilter: CageStatusFilter =
    status && validStatus.includes(status as CageStatusFilter)
      ? (status as CageStatusFilter)
      : "Active";

  const strainRaw = params.strain?.trim();
  const strainId =
    strainRaw && strainRaw !== "all" && /^\d+$/.test(strainRaw)
      ? Number(strainRaw)
      : undefined;

  const locationRaw = params.location?.trim();
  const locationId =
    locationRaw && locationRaw !== "all" ? locationRaw : undefined;

  return {
    search: params.q,
    locationId,
    strainId,
    status: statusFilter === "all" ? undefined : statusFilter,
  };
}
