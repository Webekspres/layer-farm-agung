import { tryParseBusinessDate } from "@/lib/business-date";
import { CASHFLOW_TYPES } from "@/features/finance/lib/cashflow-labels";
import type { CashflowListFilters } from "@/features/finance/types";

export function parseCashflowListFilters(params: {
  dateFrom?: string;
  dateTo?: string;
  type?: string;
}): CashflowListFilters {
  const type =
    params.type && (CASHFLOW_TYPES as readonly string[]).includes(params.type)
      ? params.type
      : undefined;

  return {
    dateFrom: tryParseBusinessDate(params.dateFrom)
      ? params.dateFrom
      : undefined,
    dateTo: tryParseBusinessDate(params.dateTo) ? params.dateTo : undefined,
    type,
  };
}
