"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import { ArrowLeft, Loader2, PackageCheck, X } from "lucide-react";
import { useActionFeedback } from "@/components/shared/action-feedback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  cancelPurchaseOrderAction,
  type CancelPurchaseOrderFormState,
} from "@/features/procurement/actions/cancel-purchase-order";
import { ReceivePurchaseOrderDialog } from "@/features/procurement/components/receive-purchase-order-dialog";
import {
  purchaseOrderStatusBadgeVariant,
  purchaseOrderStatusLabel,
} from "@/features/procurement/lib/status-labels";
import type {
  PurchaseOrderDetail,
  PurchaseOrderFormOptions,
} from "@/features/procurement/types";

const cancelInitial: CancelPurchaseOrderFormState = {};

type PurchaseOrderDetailViewProps = {
  order: PurchaseOrderDetail;
  formOptions: Pick<PurchaseOrderFormOptions, "locations">;
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
    month: "long",
    year: "numeric",
  });
}

export function PurchaseOrderDetailView({
  order,
  formOptions,
}: PurchaseOrderDetailViewProps) {
  const router = useRouter();
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const canReceive =
    order.status === "Pending" || order.status === "PartiallyReceived";
  const canCancel = order.status === "Pending";

  const [cancelState, cancelAction, cancelPending] = useActionState(
    cancelPurchaseOrderAction,
    cancelInitial,
  );

  useActionFeedback(cancelState, {
    successMessage: "Pesanan pembelian dibatalkan.",
    onSuccess: () => {
      setCancelOpen(false);
      router.refresh();
    },
    when: cancelOpen,
  });

  const receivableLines = order.items
    .map((line) => ({
      itemId: line.itemId,
      itemName: line.itemName,
      itemUnit: line.itemUnit,
      remaining: line.quantity - line.quantityReceived,
    }))
    .filter((line) => line.remaining > 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/purchase-orders">
            <ArrowLeft className="size-4" />
            Kembali
          </Link>
        </Button>
        {canReceive ? (
          <Button onClick={() => setReceiveOpen(true)}>
            <PackageCheck className="size-4" />
            Terima barang
          </Button>
        ) : null}
        {canCancel ? (
          <Button variant="ghost" onClick={() => setCancelOpen(true)}>
            <X className="size-4" />
            Batalkan PO
          </Button>
        ) : null}
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">{order.vendorName}</h2>
            <p className="text-sm text-muted-foreground">
              Tanggal pesanan: {formatDate(order.orderDate)}
            </p>
            <p className="text-sm text-muted-foreground">
              Total:{" "}
              <span className="font-semibold text-foreground">
                {formatCurrency(order.totalAmount)}
              </span>
            </p>
          </div>
          <Badge variant={purchaseOrderStatusBadgeVariant(order.status)}>
            {purchaseOrderStatusLabel(order.status)}
          </Badge>
        </div>
      </div>

      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-muted-foreground">
          Rincian barang
        </h3>
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Dipesan</TableHead>
                <TableHead className="text-right">Diterima</TableHead>
                <TableHead className="text-right">Sisa</TableHead>
                <TableHead className="text-right">Harga satuan</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((line) => (
                <TableRow key={line.id}>
                  <TableCell>
                    {line.itemName}{" "}
                    <span className="text-muted-foreground">
                      ({line.itemUnit})
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {line.quantity.toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {line.quantityReceived.toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {(line.quantity - line.quantityReceived).toLocaleString(
                      "id-ID",
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(line.unitPrice)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(line.lineTotal)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <ReceivePurchaseOrderDialog
        open={receiveOpen}
        onOpenChange={setReceiveOpen}
        poId={order.id}
        vendorName={order.vendorName}
        locations={formOptions.locations}
        lines={receivableLines}
      />

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Batalkan pesanan pembelian</DialogTitle>
          </DialogHeader>
          <form action={cancelAction}>
            <input type="hidden" name="poId" value={order.id} />
            <p className="text-sm text-muted-foreground">
              Pesanan pembelian dari {order.vendorName} akan dibatalkan.
              Tindakan ini tidak dapat diurungkan.
            </p>
            {cancelState.error ? (
              <FieldError className="mt-2">{cancelState.error}</FieldError>
            ) : null}
            <DialogFooter className="mt-4">
              <Button
                type="submit"
                variant="destructive"
                disabled={cancelPending}
              >
                {cancelPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                Batalkan PO
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
