import type { SubdomainsListFilters } from "@/features/subdomains/types";

export function parseSubdomainListFilters(params: {
  q?: string;
  status?: string;
}): SubdomainsListFilters {
  const status = params.status;
  const validStatus =
    status === "active" || status === "inactive" ? status : "all";

  return {
    search: params.q,
    status: validStatus,
  };
}
