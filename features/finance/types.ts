export type CustomersListFilters = {
  search?: string;
};

export type CustomerListItem = {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  salesOrderCount: number;
  createdAt: string;
};

export type SalesOrderLineItem = {
  eggGradeId: number;
  eggGradeName: string;
  quantity: number;
  weight: number;
  unitPrice: number;
  lineTotal: number;
};

export type SalesOrderListItem = {
  id: string;
  customerId: string;
  customerName: string;
  saleDate: string;
  status: string;
  totalAmount: number;
  itemCount: number;
  deliveryStatus: string | null;
  deliveredQuantity: number | null;
  deliveredWeight: number | null;
  createdAt: string;
};

export type SalesOrderFormOptions = {
  customers: { id: string; name: string }[];
  eggGrades: { id: number; name: string }[];
  /** Lokasi gudang + stok telur (Item Egg) tersedia di lokasi itu. */
  locations: { id: string; name: string; eggStock: number }[];
};

export type CashflowListFilters = {
  dateFrom?: string;
  dateTo?: string;
  type?: string;
};

export type CashflowTransactionListItem = {
  id: string;
  transactionDate: string;
  type: string;
  categoryId: number | null;
  categoryName: string | null;
  referenceId: string | null;
  amount: number;
  description: string | null;
  createdAt: string;
};

export type CashflowSummary = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
};

export type OpexCategoryOption = {
  id: number;
  name: string;
};

export type CashflowFormOptions = {
  opexCategories: OpexCategoryOption[];
};
