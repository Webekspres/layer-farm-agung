import type { StockMutationListFilters } from "@/features/inventory/types";
import { StockMutationType } from "@/features/inventory/lib/stock-mutation-types";

const MUTATION_TYPE_VALUES: string[] = Object.values(StockMutationType);

function parseDateParam(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function parseStockMutationListFilters(params: {
  q?: string;
  type?: string;
  location?: string;
  from?: string;
  to?: string;
}): StockMutationListFilters {
  const type =
    params.type && MUTATION_TYPE_VALUES.includes(params.type)
      ? params.type
      : undefined;

  const locationRaw = params.location?.trim();
  const locationId =
    locationRaw && locationRaw !== "all" ? locationRaw : undefined;

  return {
    search: params.q?.trim() || undefined,
    type,
    locationId,
    from: parseDateParam(params.from),
    to: parseDateParam(params.to),
  };
}
