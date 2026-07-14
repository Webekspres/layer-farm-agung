export type FinanceTabId = "cashflow" | "sales" | "customers";

export const FINANCE_TABS: { id: FinanceTabId; label: string }[] = [
  { id: "cashflow", label: "Arus kas" },
  { id: "sales", label: "Penjualan" },
  { id: "customers", label: "Pelanggan" },
];

export function parseFinanceTab(value: string | undefined): FinanceTabId {
  if (value === "sales" || value === "customers") {
    return value;
  }
  return "cashflow";
}
