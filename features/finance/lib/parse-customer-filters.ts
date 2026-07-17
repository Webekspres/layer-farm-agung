import type { CustomersListFilters } from "@/features/finance/types";

export function parseCustomerListFilters(params: {
  q?: string;
}): CustomersListFilters {
  return {
    search: params.q,
  };
}
