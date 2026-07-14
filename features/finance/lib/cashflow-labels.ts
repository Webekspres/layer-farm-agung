export const CASHFLOW_TYPES = ["Income", "Expense"] as const;

export type CashflowType = (typeof CASHFLOW_TYPES)[number];

export const CASHFLOW_TYPE_LABELS: Record<CashflowType, string> = {
  Income: "Pemasukan",
  Expense: "Pengeluaran",
};

export const DEFAULT_OPEX_CATEGORY_NAME = "Operasional";
