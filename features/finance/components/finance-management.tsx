"use client";

import { FinanceTabs } from "@/features/finance/components/finance-tabs";
import { CashflowManagement } from "@/features/finance/components/cashflow-management";
import { SalesOrdersManagement } from "@/features/finance/components/sales-orders-management";
import { CustomersManagement } from "@/features/finance/components/customers-management";
import type { FinanceTabId } from "@/features/finance/config/finance-tabs";
import type {
  CashflowSummary,
  CashflowTransactionListItem,
  CustomerListItem,
  OpexCategoryOption,
  SalesOrderFormOptions,
  SalesOrderListItem,
} from "@/features/finance/types";
import type { PaginationMeta } from "@/lib/pagination";

type FinanceManagementProps = {
  activeTab: FinanceTabId;
  cashflow: {
    transactions: CashflowTransactionListItem[];
    pagination: PaginationMeta;
    opexCategories: OpexCategoryOption[];
    summary: CashflowSummary;
  };
  sales: {
    orders: SalesOrderListItem[];
    pagination: PaginationMeta;
    formOptions: SalesOrderFormOptions;
  };
  customers: {
    items: CustomerListItem[];
    pagination: PaginationMeta;
  };
};

export function FinanceManagement({
  activeTab,
  cashflow,
  sales,
  customers,
}: FinanceManagementProps) {
  return (
    <div className="flex flex-col gap-6">
      <FinanceTabs activeTab={activeTab} />

      {activeTab === "cashflow" ? (
        <CashflowManagement
          transactions={cashflow.transactions}
          pagination={cashflow.pagination}
          opexCategories={cashflow.opexCategories}
          summary={cashflow.summary}
        />
      ) : null}

      {activeTab === "sales" ? (
        <SalesOrdersManagement
          orders={sales.orders}
          pagination={sales.pagination}
          formOptions={sales.formOptions}
        />
      ) : null}

      {activeTab === "customers" ? (
        <CustomersManagement
          customers={customers.items}
          pagination={customers.pagination}
        />
      ) : null}
    </div>
  );
}
