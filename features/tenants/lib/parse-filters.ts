import type { TenantsListFilters } from "@/features/tenants/types";

export function parseTenantListFilters(params: {
  q?: string;
  status?: string;
}): TenantsListFilters {
  const status = params.status;
  const validStatus =
    status === "active" || status === "inactive" ? status : "all";

  return {
    search: params.q,
    status: validStatus,
  };
}
