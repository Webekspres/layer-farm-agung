"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import { useActionFeedback } from "@/components/shared/action-feedback";
import { Loader2, PackageCheck, Plus, Trash2 } from "lucide-react";
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
  createPurchaseOrderAction,
  type PurchaseOrderFormState,
} from "@/features/procurement/actions/create-purchase-order";
import { ReceivePurchaseOrderDialog } from "@/features/procurement/components/receive-purchase-order-dialog";
import {
  purchaseOrderStatusBadgeVariant,
  purchaseOrderStatusLabel,
} from "@/features/procurement/lib/status-labels";
import type {
  PurchaseOrderFormOptions,
  PurchaseOrderListItem,
} from "@/features/procurement/types";
import { TablePagination } from "@/components/shared/table-pagination";
import {
  RecordDateHiddenInput,
  RecordDatePicker,
  todayRecordDateValue,
} from "@/components/shared/record-date-picker";
import type { PaginationMeta } from "@/lib/pagination";

const formInitial: PurchaseOrderFormState = {};

type LineDraft = {
  itemId: string;
  quantity: string;
  unitPrice: string;
};

type PurchaseOrdersManagementProps = {
  orders: PurchaseOrderListItem[];
  pagination: PaginationMeta;
  formOptions: PurchaseOrderFormOptions;
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

function statusBadge(status: PurchaseOrderListItem["status"]) {
  return (
    <Badge variant={purchaseOrderStatusBadgeVariant(status)}>
      {purchaseOrderStatusLabel(status)}
    </Badge>
  );
}

export function PurchaseOrdersManagement({
  orders,
  pagination,
  formOptions,
}: PurchaseOrdersManagementProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [receiveTarget, setReceiveTarget] =
    useState<PurchaseOrderListItem | null>(null);
  const [vendorId, setVendorId] = useState(formOptions.vendors[0]?.id ?? "");
  const [orderDate, setOrderDate] = useState<Date>(() => todayRecordDateValue());
  const [lines, setLines] = useState<LineDraft[]>([
    {
      itemId: formOptions.items[0]?.id ?? "",
      quantity: "",
      unitPrice: "",
    },
  ]);

  const [state, action, pending] = useActionState(
    createPurchaseOrderAction,
    formInitial,
  );

  useActionFeedback(state, {
    successMessage: "Pesanan pembelian berhasil dibuat.",
    onSuccess: () => {
      setCreateOpen(false);
      if (state.poId) {
        router.push(`/dashboard/purchase-orders/${state.poId}`);
      }
    },
    when: createOpen,
  });

  function openCreateDialog() {
    setOrderDate(todayRecordDateValue());
    setVendorId(formOptions.vendors[0]?.id ?? "");
    setLines([
      {
        itemId: formOptions.items[0]?.id ?? "",
        quantity: "",
        unitPrice: "",
      },
    ]);
    setCreateOpen(true);
  }

  function addLine() {
    setLines((prev) => [
      ...prev,
      {
        itemId: formOptions.items[0]?.id ?? "",
        quantity: "",
        unitPrice: "",
      },
    ]);
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
      .filter((l) => l.itemId && l.quantity && l.unitPrice)
      .map((l) => ({
        itemId: l.itemId,
        quantity: Number(l.quantity),
        unitPrice: Number(l.unitPrice),
      })),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button
          onClick={openCreateDialog}
          disabled={
            formOptions.vendors.length === 0 || formOptions.items.length === 0
          }
        >
          <Plus className="size-4" />
          Buat PO
        </Button>
      </div>

      {formOptions.vendors.length === 0 || formOptions.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Tambahkan vendor dan item inventori terlebih dahulu sebelum membuat PO.
        </p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {orders.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            Belum ada pesanan pembelian.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Tanggal</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Item</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{formatDate(order.orderDate)}</TableCell>
                  <TableCell>{order.vendorName}</TableCell>
                  <TableCell>{statusBadge(order.status)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(order.totalAmount)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {order.itemCount}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-1">
                      {order.status === "Pending" ||
                      order.status === "PartiallyReceived" ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setReceiveTarget(order)}
                        >
                          <PackageCheck className="size-4" />
                          Terima
                        </Button>
                      ) : null}
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/purchase-orders/${order.id}`}>
                          Detail
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <TablePagination {...pagination} entityName="pesanan" />

      {receiveTarget ? (
        <ReceivePurchaseOrderDialog
          open={Boolean(receiveTarget)}
          onOpenChange={(open) => {
            if (!open) setReceiveTarget(null);
          }}
          poId={receiveTarget.id}
          vendorName={receiveTarget.vendorName}
          locations={formOptions.locations}
        />
      ) : null}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="flex max-h-[min(90vh,720px)] max-w-xl flex-col gap-0 overflow-hidden p-0">
          <DialogHeader className="shrink-0 border-b border-border px-6 py-4">
            <DialogTitle>Buat pesanan pembelian</DialogTitle>
          </DialogHeader>
          <form action={action} className="flex min-h-0 flex-1 flex-col">
            <input type="hidden" name="itemsJson" value={itemsJson} />
            <RecordDateHiddenInput name="orderDate" value={orderDate} />
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="po-vendor">Vendor</FieldLabel>
                  <Select value={vendorId} onValueChange={setVendorId} required>
                    <SelectTrigger id="po-vendor">
                      <SelectValue placeholder="Pilih vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {formOptions.vendors.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <input type="hidden" name="vendorId" value={vendorId} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="po-date">Tanggal pesanan</FieldLabel>
                  <RecordDatePicker
                    id="po-date"
                    value={orderDate}
                    onChange={setOrderDate}
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
                              Item
                            </FieldLabel>
                            <Select
                              value={line.itemId}
                              onValueChange={(v) =>
                                updateLine(index, { itemId: v })
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih item" />
                              </SelectTrigger>
                              <SelectContent>
                                {formOptions.items.map((item) => (
                                  <SelectItem key={item.id} value={item.id}>
                                    {item.name} ({item.unit})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </Field>

                          <div className="flex items-end gap-2">
                            <Field className="min-w-0 flex-1">
                              <FieldLabel className="text-xs text-muted-foreground">
                                Jumlah
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
                            <Field className="min-w-0 flex-1">
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
                Simpan PO
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
