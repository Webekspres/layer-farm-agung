import type { VendorsListFilters } from "@/features/vendors/types";
import { vendorCategories } from "@/features/vendors/schemas/vendor";

export function parseVendorListFilters(params: {
  q?: string;
  category?: string;
}): VendorsListFilters {
  const category =
    params.category &&
    (vendorCategories as readonly string[]).includes(params.category)
      ? params.category
      : undefined;

  return {
    search: params.q,
    category,
  };
}
