"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, PackageCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReceivePurchaseOrderDialog } from "@/features/procurement/components/receive-purchase-order-dialog";
import type {
  PurchaseOrderDetail,
  PurchaseOrderFormOptions,
} from "@/features/procurement/types";

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
  const [receiveOpen, setReceiveOpen] = useState(false);
  const isPending = order.status === "Pending";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/purchase-orders">
            <ArrowLeft className="size-4" />
            Kembali
          </Link>
        </Button>
        {isPending ? (
          <Button onClick={() => setReceiveOpen(true)}>
            <PackageCheck className="size-4" />
            Terima barang
          </Button>
        ) : (
          <Badge variant="secondary">Sudah diterima</Badge>
        )}
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
          <Badge variant={isPending ? "outline" : "secondary"}>
            {isPending ? "Menunggu penerimaan" : "Diterima"}
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
                <TableHead className="text-right">Jumlah</TableHead>
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
      />
    </div>
  );
}
