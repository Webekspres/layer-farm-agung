"use client";

import { useActionState, useState } from "react";
import { useActionFeedback } from "@/components/shared/action-feedback";
import { ArrowDownCircle, ArrowUpCircle, Loader2, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CashflowToolbar } from "@/features/finance/components/cashflow-toolbar";
import {
  createCashflowTransactionAction,
  type CashflowTransactionFormState,
} from "@/features/finance/actions/create-cashflow-transaction";
import { CASHFLOW_TYPE_LABELS } from "@/features/finance/lib/cashflow-labels";
import type {
  CashflowSummary,
  CashflowTransactionListItem,
  OpexCategoryOption,
} from "@/features/finance/types";
import { TablePagination } from "@/components/shared/table-pagination";
import {
  RecordDateHiddenInput,
  RecordDatePicker,
  todayRecordDateValue,
} from "@/components/shared/record-date-picker";
import type { PaginationMeta } from "@/lib/pagination";

const formInitial: CashflowTransactionFormState = {};

type CashflowManagementProps = {
  transactions: CashflowTransactionListItem[];
  pagination: PaginationMeta;
  opexCategories: OpexCategoryOption[];
  summary: CashflowSummary;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function CashflowManagement({
  transactions,
  pagination,
  opexCategories,
  summary,
}: CashflowManagementProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [categoryId, setCategoryId] = useState(
    opexCategories[0]?.id ? String(opexCategories[0].id) : "",
  );
  const [transactionDate, setTransactionDate] = useState<Date>(() =>
    todayRecordDateValue(),
  );

  const [state, action, pending] = useActionState(
    createCashflowTransactionAction,
    formInitial,
  );

  useActionFeedback(state, {
    successMessage: "Pengeluaran berhasil dicatat.",
    onSuccess: () => setCreateOpen(false),
    when: createOpen,
  });

  function openCreateDialog() {
    setTransactionDate(todayRecordDateValue());
    setCategoryId(opexCategories[0]?.id ? String(opexCategories[0].id) : "");
    setCreateOpen(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pemasukan
            </CardTitle>
            <ArrowUpCircle className="size-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-foreground">
              {formatCurrency(summary.totalIncome)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pengeluaran
            </CardTitle>
            <ArrowDownCircle className="size-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-foreground">
              {formatCurrency(summary.totalExpense)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Saldo
            </CardTitle>
            <Wallet className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-foreground">
              {formatCurrency(summary.balance)}
            </p>
          </CardContent>
        </Card>
      </div>

      <CashflowToolbar onCreateExpenseClick={openCreateDialog} />

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {transactions.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            Belum ada transaksi kas pada rentang tanggal ini.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Tanggal</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Catatan</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{formatDate(tx.transactionDate)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={tx.type === "Income" ? "secondary" : "outline"}
                    >
                      {CASHFLOW_TYPE_LABELS[tx.type as "Income" | "Expense"] ??
                        tx.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{tx.categoryName ?? "—"}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">
                    {tx.description ?? "—"}
                  </TableCell>
                  <TableCell
                    className={
                      tx.type === "Income"
                        ? "text-right tabular-nums text-emerald-600"
                        : "text-right tabular-nums text-destructive"
                    }
                  >
                    {tx.type === "Income" ? "+" : "-"}
                    {formatCurrency(tx.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <TablePagination {...pagination} entityName="transaksi" />
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Catat pengeluaran</DialogTitle>
          </DialogHeader>
          <form action={action}>
            <input type="hidden" name="type" value="Expense" />
            <RecordDateHiddenInput
              name="transactionDate"
              value={transactionDate}
            />
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="expense-date">Tanggal</FieldLabel>
                <RecordDatePicker
                  id="expense-date"
                  value={transactionDate}
                  onChange={setTransactionDate}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="expense-category">
                  Kategori opex
                </FieldLabel>
                <Select value={categoryId} onValueChange={setCategoryId} required>
                  <SelectTrigger id="expense-category">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {opexCategories.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input type="hidden" name="categoryId" value={categoryId} />
              </Field>
              <Field>
                <FieldLabel htmlFor="expense-amount">Jumlah (Rp)</FieldLabel>
                <Input
                  id="expense-amount"
                  name="amount"
                  type="number"
                  min="0"
                  step="any"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="expense-description">
                  Catatan (opsional)
                </FieldLabel>
                <Input id="expense-description" name="description" />
              </Field>
              {state.error ? <FieldError>{state.error}</FieldError> : null}
            </FieldGroup>
            <DialogFooter className="mt-4">
              <Button type="submit" disabled={pending}>
                {pending ? <Loader2 className="size-4 animate-spin" /> : null}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
