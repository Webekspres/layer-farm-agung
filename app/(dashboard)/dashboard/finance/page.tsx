import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TenantRequiredPanel } from "@/features/master-data/components/tenant-required-panel";
import { FinanceManagement } from "@/features/finance/components/finance-management";
import {
  getFinanceTenantScope,
  requireViewCashflowSession,
} from "@/features/finance/lib/access";
import { parseFinanceTab } from "@/features/finance/config/finance-tabs";
import { parseCashflowListFilters } from "@/features/finance/lib/parse-cashflow-filters";
import { parseCustomerListFilters } from "@/features/finance/lib/parse-customer-filters";
import { listCustomers } from "@/features/finance/services/list-customers";
import { listSalesOrders } from "@/features/finance/services/list-sales-orders";
import { getSalesOrderFormOptions } from "@/features/finance/services/get-sales-order-form-options";
import {
  getCashflowSummary,
  listCashflowTransactions,
} from "@/features/finance/services/list-cashflow-transactions";
import { listOpexCategories } from "@/features/finance/services/list-opex-categories";
import { parsePage, parsePageSize } from "@/lib/pagination";

type FinancePageProps = {
  searchParams: Promise<{
    tab?: string;
    q?: string;
    dateFrom?: string;
    dateTo?: string;
    type?: string;
    page?: string;
    pageSize?: string;
  }>;
};

const emptyPagination = { items: [], total: 0, page: 1, pageSize: 10, totalPages: 1 };

export default async function FinancePage({ searchParams }: FinancePageProps) {
  const session = await requireViewCashflowSession();
  const { tenantId, needsTenantSelection } = getFinanceTenantScope(session);
  const params = await searchParams;

  const activeTab = parseFinanceTab(params.tab);
  const page = parsePage(params.page);
  const pageSize = parsePageSize(params.pageSize);
  const hasTenant = Boolean(tenantId && !needsTenantSelection);

  const cashflowFilters = parseCashflowListFilters(params);
  const customerFilters = parseCustomerListFilters(params);

  const [cashflowResult, opexCategories, cashflowSummary] = hasTenant
    ? await Promise.all([
        activeTab === "cashflow"
          ? listCashflowTransactions(tenantId!, {
              ...cashflowFilters,
              page,
              pageSize,
            })
          : Promise.resolve(emptyPagination),
        listOpexCategories(tenantId!),
        activeTab === "cashflow"
          ? getCashflowSummary(tenantId!, cashflowFilters)
          : Promise.resolve({ totalIncome: 0, totalExpense: 0, balance: 0 }),
      ])
    : [emptyPagination, [], { totalIncome: 0, totalExpense: 0, balance: 0 }];

  const [salesResult, salesFormOptions] = hasTenant
    ? await Promise.all([
        activeTab === "sales"
          ? listSalesOrders(tenantId!, { page, pageSize })
          : Promise.resolve(emptyPagination),
        activeTab === "sales"
          ? getSalesOrderFormOptions(tenantId!)
          : Promise.resolve({ customers: [], eggGrades: [], locations: [] }),
      ])
    : [emptyPagination, { customers: [], eggGrades: [], locations: [] }];

  const customersResult = hasTenant
    ? activeTab === "customers"
      ? await listCustomers(tenantId!, { ...customerFilters, page, pageSize })
      : emptyPagination
    : emptyPagination;

  return (
    <>
      <PageHeader
        title="Keuangan"
        description="Arus kas, penjualan telur, dan data pelanggan peternakan."
      />
      {needsTenantSelection ? (
        <TenantRequiredPanel />
      ) : (
        <Suspense fallback={null}>
          <FinanceManagement
            activeTab={activeTab}
            cashflow={{
              transactions: cashflowResult.items,
              pagination: {
                page: cashflowResult.page,
                pageSize: cashflowResult.pageSize,
                total: cashflowResult.total,
                totalPages: cashflowResult.totalPages,
              },
              opexCategories,
              summary: cashflowSummary,
            }}
            sales={{
              orders: salesResult.items,
              pagination: {
                page: salesResult.page,
                pageSize: salesResult.pageSize,
                total: salesResult.total,
                totalPages: salesResult.totalPages,
              },
              formOptions: salesFormOptions,
            }}
            customers={{
              items: customersResult.items,
              pagination: {
                page: customersResult.page,
                pageSize: customersResult.pageSize,
                total: customersResult.total,
                totalPages: customersResult.totalPages,
              },
            }}
          />
        </Suspense>
      )}
    </>
  );
}
