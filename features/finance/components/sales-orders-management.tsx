"use client";

import { useActionState, useState } from "react";
import { useActionFeedback } from "@/components/shared/action-feedback";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  createSalesOrderAction,
  type SalesOrderFormState,
} from "@/features/finance/actions/create-sales-order";
import type {
  SalesOrderFormOptions,
  SalesOrderListItem,
} from "@/features/finance/types";
import { TablePagination } from "@/components/shared/table-pagination";
import {
  RecordDateHiddenInput,
  RecordDatePicker,
  todayRecordDateValue,
} from "@/components/shared/record-date-picker";
import type { PaginationMeta } from "@/lib/pagination";

const formInitial: SalesOrderFormState = {};

type LineDraft = {
  eggGradeId: string;
  quantity: string;
  weight: string;
  unitPrice: string;
};

type SalesOrdersManagementProps = {
  orders: SalesOrderListItem[];
  pagination: PaginationMeta;
  formOptions: SalesOrderFormOptions;
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

function emptyLine(formOptions: SalesOrderFormOptions): LineDraft {
  return {
    eggGradeId: formOptions.eggGrades[0]?.id ? String(formOptions.eggGrades[0].id) : "",
    quantity: "",
    weight: "",
    unitPrice: "",
  };
}

export function SalesOrdersManagement({
  orders,
  pagination,
  formOptions,
}: SalesOrdersManagementProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [customerId, setCustomerId] = useState(
    formOptions.customers[0]?.id ?? "",
  );
  const [saleDate, setSaleDate] = useState<Date>(() => todayRecordDateValue());
  const [lines, setLines] = useState<LineDraft[]>([emptyLine(formOptions)]);

  const [state, action, pending] = useActionState(
    createSalesOrderAction,
    formInitial,
  );

  useActionFeedback(state, {
    successMessage: "Penjualan berhasil dicatat.",
    onSuccess: () => setCreateOpen(false),
    when: createOpen,
  });

  function openCreateDialog() {
    setSaleDate(todayRecordDateValue());
    setCustomerId(formOptions.customers[0]?.id ?? "");
    setLines([emptyLine(formOptions)]);
    setCreateOpen(true);
  }

  function addLine() {
    setLines((prev) => [...prev, emptyLine(formOptions)]);
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  function updateLine(index: number, patch: Partial<LineDraft>) {
    setLines((prev) =>
      prev.map((line, i) => (i === index ? { ...line, ...patch } : line)),
    );
  }

  const itemsJson = JSON.stringify(
    lines
      .filter((l) => l.eggGradeId && l.quantity && l.weight && l.unitPrice)
      .map((l) => ({
        eggGradeId: Number(l.eggGradeId),
        quantity: Number(l.quantity),
        weight: Number(l.weight),
        unitPrice: Number(l.unitPrice),
      })),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button
          onClick={openCreateDialog}
          disabled={
            formOptions.customers.length === 0 ||
            formOptions.eggGrades.length === 0
          }
        >
          <Plus className="size-4" />
          Catat penjualan
        </Button>
      </div>

      {formOptions.customers.length === 0 || formOptions.eggGrades.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Tambahkan pelanggan dan pastikan grade telur tersedia sebelum
          mencatat penjualan.
        </p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {orders.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            Belum ada transaksi penjualan.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Tanggal</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Baris</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{formatDate(order.saleDate)}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">Lunas</Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(order.totalAmount)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {order.itemCount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <TablePagination {...pagination} entityName="transaksi" />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="flex max-h-[min(90vh,720px)] max-w-xl flex-col gap-0 overflow-hidden p-0">
          <DialogHeader className="shrink-0 border-b border-border px-6 py-4">
            <DialogTitle>Catat penjualan telur</DialogTitle>
          </DialogHeader>
          <form action={action} className="flex min-h-0 flex-1 flex-col">
            <input type="hidden" name="itemsJson" value={itemsJson} />
            <RecordDateHiddenInput name="saleDate" value={saleDate} />
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="so-customer">Pelanggan</FieldLabel>
                  <Select
                    value={customerId}
                    onValueChange={setCustomerId}
                    required
                  >
                    <SelectTrigger id="so-customer">
                      <SelectValue placeholder="Pilih pelanggan" />
                    </SelectTrigger>
                    <SelectContent>
                      {formOptions.customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <input type="hidden" name="customerId" value={customerId} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="so-date">Tanggal penjualan</FieldLabel>
                  <RecordDatePicker
                    id="so-date"
                    value={saleDate}
                    onChange={setSaleDate}
                  />
                </Field>

                <div className="flex flex-col gap-2">
                  <FieldLabel>Barang</FieldLabel>
                  <div className="max-h-[min(40vh,280px)] overflow-y-auto rounded-lg border border-border bg-muted/20 p-2">
                    <div className="flex flex-col gap-3">
                      {lines.map((line, index) => (
                        <div
                          key={index}
                          className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3"
                        >
                          <Field>
                            <FieldLabel className="text-xs text-muted-foreground">
                              Grade telur
                            </FieldLabel>
                            <Select
                              value={line.eggGradeId}
                              onValueChange={(v) =>
                                updateLine(index, { eggGradeId: v })
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih grade" />
                              </SelectTrigger>
                              <SelectContent>
                                {formOptions.eggGrades.map((grade) => (
                                  <SelectItem
                                    key={grade.id}
                                    value={String(grade.id)}
                                  >
                                    {grade.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </Field>

                          <div className="grid grid-cols-3 gap-2">
                            <Field>
                              <FieldLabel className="text-xs text-muted-foreground">
                                Jumlah (butir)
                              </FieldLabel>
                              <Input
                                type="number"
                                min="0"
                                step="any"
                                placeholder="0"
                                value={line.quantity}
                                onChange={(e) =>
                                  updateLine(index, {
                                    quantity: e.target.value,
                                  })
                                }
                              />
                            </Field>
                            <Field>
                              <FieldLabel className="text-xs text-muted-foreground">
                                Berat (kg)
                              </FieldLabel>
                              <Input
                                type="number"
                                min="0"
                                step="any"
                                placeholder="0"
                                value={line.weight}
                                onChange={(e) =>
                                  updateLine(index, { weight: e.target.value })
                                }
                              />
                            </Field>
                            <Field>
                              <FieldLabel className="text-xs text-muted-foreground">
                                Harga satuan
                              </FieldLabel>
                              <Input
                                type="number"
                                min="0"
                                step="any"
                                placeholder="0"
                                value={line.unitPrice}
                                onChange={(e) =>
                                  updateLine(index, {
                                    unitPrice: e.target.value,
                                  })
                                }
                              />
                            </Field>
                          </div>
                          <div className="flex justify-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="shrink-0"
                              onClick={() => removeLine(index)}
                              disabled={lines.length <= 1}
                              aria-label="Hapus baris"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addLine}
                  >
                    <Plus className="size-4" />
                    Tambah barang
                  </Button>
                </div>

                {state.error ? <FieldError>{state.error}</FieldError> : null}
              </FieldGroup>
            </div>
            <DialogFooter className="shrink-0 border-t border-border px-6 py-4">
              <Button type="submit" disabled={pending}>
                {pending ? <Loader2 className="size-4 animate-spin" /> : null}
                Simpan penjualan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
