import prisma from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { formatBusinessDateFromDb, parseBusinessDate } from "@/lib/business-date";
import type {
  CashflowListFilters,
  CashflowSummary,
  CashflowTransactionListItem,
} from "@/features/finance/types";
import type { PaginationMeta } from "@/lib/pagination";

function buildWhere(
  tenantId: string,
  { dateFrom, dateTo, type }: CashflowListFilters,
): Prisma.CashflowTransactionWhereInput {
  const where: Prisma.CashflowTransactionWhereInput = { tenant_id: tenantId };

  if (type) {
    where.type = type;
  }

  if (dateFrom || dateTo) {
    where.transaction_date = {
      ...(dateFrom ? { gte: parseBusinessDate(dateFrom) } : {}),
      ...(dateTo ? { lte: parseBusinessDate(dateTo) } : {}),
    };
  }

  return where;
}

export type PaginatedCashflowTransactionsResult = {
  items: CashflowTransactionListItem[];
} & PaginationMeta;

function mapRow(row: {
  id: string;
  transaction_date: Date;
  type: string;
  category_id: number | null;
  reference_id: string | null;
  amount: { toNumber(): number } | number;
  description: string | null;
  created_at: Date;
  opex_category: { name: string } | null;
}): CashflowTransactionListItem {
  const amount =
    typeof row.amount === "number" ? row.amount : row.amount.toNumber();

  return {
    id: row.id,
    transactionDate: formatBusinessDateFromDb(row.transaction_date),
    type: row.type,
    categoryId: row.category_id,
    categoryName: row.opex_category?.name ?? null,
    referenceId: row.reference_id,
    amount,
    description: row.description,
    createdAt: row.created_at.toISOString(),
  };
}

export async function listCashflowTransactions(
  tenantId: string,
  filters: CashflowListFilters & { page?: number; pageSize?: number } = {},
): Promise<PaginatedCashflowTransactionsResult> {
  const { page, pageSize, ...searchFilters } = filters;
  const where = buildWhere(tenantId, searchFilters);
  const include = { opex_category: { select: { name: true } } } as const;

  if (page !== undefined && pageSize !== undefined) {
    const total = await prisma.cashflowTransaction.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const skip = (safePage - 1) * pageSize;

    const rows = await prisma.cashflowTransaction.findMany({
      where,
      include,
      orderBy: { transaction_date: "desc" },
      skip,
      take: pageSize,
    });

    return {
      items: rows.map(mapRow),
      total,
      page: safePage,
      pageSize,
      totalPages,
    };
  }

  const rows = await prisma.cashflowTransaction.findMany({
    where,
    include,
    orderBy: { transaction_date: "desc" },
  });
  const mapped = rows.map(mapRow);

  return {
    items: mapped,
    total: mapped.length,
    page: 1,
    pageSize: mapped.length || 10,
    totalPages: 1,
  };
}

export async function getCashflowSummary(
  tenantId: string,
  filters: CashflowListFilters = {},
): Promise<CashflowSummary> {
  const where = buildWhere(tenantId, filters);

  const [incomeAgg, expenseAgg] = await Promise.all([
    prisma.cashflowTransaction.aggregate({
      where: { ...where, type: "Income" },
      _sum: { amount: true },
    }),
    prisma.cashflowTransaction.aggregate({
      where: { ...where, type: "Expense" },
      _sum: { amount: true },
    }),
  ]);

  const totalIncome = incomeAgg._sum.amount?.toNumber() ?? 0;
  const totalExpense = expenseAgg._sum.amount?.toNumber() ?? 0;

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
  };
}
