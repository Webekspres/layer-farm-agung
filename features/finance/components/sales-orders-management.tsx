"use client";

import { useActionState, useMemo, useState } from "react";
import { useActionFeedback } from "@/components/shared/action-feedback";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
const NO_GRADE = "__none__";

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

function emptyLine(): LineDraft {
  return {
    eggGradeId: NO_GRADE,
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
  const [locationId, setLocationId] = useState(
    formOptions.locations[0]?.id ?? "",
  );
  const [saleDate, setSaleDate] = useState<Date>(() => todayRecordDateValue());
  const [lines, setLines] = useState<LineDraft[]>([emptyLine()]);

  const [state, action, pending] = useActionState(
    createSalesOrderAction,
    formInitial,
  );

  useActionFeedback(state, {
    successMessage: "Penjualan berhasil dicatat.",
    onSuccess: () => setCreateOpen(false),
    when: createOpen,
  });

  const selectedLocation = useMemo(
    () => formOptions.locations.find((l) => l.id === locationId),
    [formOptions.locations, locationId],
  );

  const canCreate =
    formOptions.customers.length > 0 && formOptions.locations.length > 0;

  function openCreateDialog() {
    setSaleDate(todayRecordDateValue());
    setCustomerId(formOptions.customers[0]?.id ?? "");
    setLocationId(formOptions.locations[0]?.id ?? "");
    setLines([emptyLine()]);
    setCreateOpen(true);
  }

  function addLine() {
    setLines((prev) => [...prev, emptyLine()]);
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
      .filter((l) => l.quantity && l.unitPrice !== "")
      .map((l) => {
        const row: {
          eggGradeId?: number;
          quantity: number;
          weight?: number;
          unitPrice: number;
        } = {
          quantity: Number(l.quantity),
          unitPrice: Number(l.unitPrice),
        };
        if (l.eggGradeId && l.eggGradeId !== NO_GRADE) {
          row.eggGradeId = Number(l.eggGradeId);
        }
        if (l.weight !== "") {
          row.weight = Number(l.weight);
        }
        return row;
      }),
  );

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={openCreateDialog} disabled={!canCreate}>
          <Plus className="size-4" />
          Catat penjualan
        </Button>
      </div>

      {!canCreate ? (
        <p className="text-sm text-muted-foreground">
          Tambahkan pelanggan dan pastikan ada lokasi gudang sebelum mencatat
          penjualan dari stok telur panen (TB).
        </p>
      ) : null}

      <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
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
        <TablePagination {...pagination} entityName="transaksi" />
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="dialog-shell sm:max-w-lg md:max-w-xl">
          <DialogHeader className="dialog-header-padding">
            <DialogTitle>Catat penjualan telur</DialogTitle>
            <DialogDescription>
              Keluar stok telur bagus (TB) dari gudang lokasi yang dipilih.
            </DialogDescription>
          </DialogHeader>

          <div className="dialog-body-scroll pb-4">
            <form action={action} id="sales-order-form">
              <input type="hidden" name="itemsJson" value={itemsJson} />
              <RecordDateHiddenInput name="saleDate" value={saleDate} />
              <FieldGroup className="gap-5">
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
                  <FieldLabel htmlFor="so-location">Lokasi gudang</FieldLabel>
                  <Select
                    value={locationId}
                    onValueChange={setLocationId}
                    required
                  >
                    <SelectTrigger id="so-location">
                      <SelectValue placeholder="Pilih lokasi" />
                    </SelectTrigger>
                    <SelectContent>
                      {formOptions.locations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <input type="hidden" name="locationId" value={locationId} />
                  {selectedLocation ? (
                    <p className="text-xs text-muted-foreground">
                      Stok telur tersedia:{" "}
                      <span className="font-medium tabular-nums text-foreground">
                        {selectedLocation.eggStock.toLocaleString("id-ID")}
                      </span>{" "}
                      butir
                    </p>
                  ) : null}
                </Field>
                <Field>
                  <FieldLabel htmlFor="so-date">Tanggal penjualan</FieldLabel>
                  <RecordDatePicker
                    id="so-date"
                    value={saleDate}
                    onChange={setSaleDate}
                  />
                </Field>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <FieldLabel className="mb-0">Barang</FieldLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addLine}
                    >
                      <Plus className="size-4" />
                      Tambah
                    </Button>
                  </div>

                  <div className="flex flex-col gap-3">
                    {lines.map((line, index) => (
                      <div
                        key={index}
                        className="rounded-lg border border-border bg-muted/20 p-4"
                      >
                        <div className="mb-3 flex items-start gap-2">
                          <Field className="min-w-0 flex-1">
                            <FieldLabel className="text-xs text-muted-foreground">
                              Grade (opsional)
                            </FieldLabel>
                            <Select
                              value={line.eggGradeId}
                              onValueChange={(v) =>
                                updateLine(index, { eggGradeId: v })
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Tanpa grade" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={NO_GRADE}>
                                  Tanpa grade
                                </SelectItem>
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
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="mt-6 shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={() => removeLine(index)}
                            disabled={lines.length <= 1}
                            aria-label="Hapus baris"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <Field>
                            <FieldLabel className="text-xs text-muted-foreground">
                              Jumlah (butir)
                            </FieldLabel>
                            <Input
                              type="number"
                              min="1"
                              step="1"
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
                              Berat kg (opsional)
                            </FieldLabel>
                            <Input
                              type="number"
                              min="0"
                              step="any"
                              placeholder="—"
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
                      </div>
                    ))}
                  </div>
                </div>

                {state.error ? <FieldError>{state.error}</FieldError> : null}
              </FieldGroup>
            </form>
          </div>

          <DialogFooter className="dialog-footer-padding">
            <Button type="submit" form="sales-order-form" disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              Simpan penjualan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
