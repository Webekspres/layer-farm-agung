"use client";

import { useActionState, useState } from "react";
import { useActionFeedback } from "@/components/shared/action-feedback";
import { Loader2, Plus } from "lucide-react";
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
  adjustStockAction,
} from "@/features/inventory/actions/adjust-stock";
import type { ItemFormState } from "@/features/inventory/actions/create-item";
import { ITEM_TYPE_LABELS } from "@/features/inventory/lib/item-type-labels";
import { mutationTypeLabel } from "@/features/inventory/lib/mutation-type-labels";
import type { ItemDetail } from "@/features/inventory/types";
import { cn } from "@/lib/utils";

const formInitial: ItemFormState = {};

type ItemDetailViewProps = {
  item: ItemDetail;
  locations: { id: string; name: string }[];
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ItemDetailView({ item, locations }: ItemDetailViewProps) {
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [locationId, setLocationId] = useState(
    item.stockByLocation[0]?.locationId ?? locations[0]?.id ?? "",
  );
  const [direction, setDirection] = useState<"IN" | "OUT">("IN");

  const [state, action, pending] = useActionState(
    adjustStockAction,
    formInitial,
  );

  useActionFeedback(state, {
    successMessage: "Penyesuaian stok tersimpan.",
    onSuccess: () => setAdjustOpen(false),
    when: adjustOpen,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">{item.name}</span>
            <Badge variant="outline">{ITEM_TYPE_LABELS[item.type]}</Badge>
            {item.lowStock ? (
              <Badge variant="destructive">Stok rendah</Badge>
            ) : null}
          </div>
          <span className="text-sm text-muted-foreground">
            Total stok:{" "}
            <span
              className={cn(
                "font-semibold tabular-nums text-foreground",
                item.lowStock && "text-destructive",
              )}
            >
              {item.totalQuantity.toLocaleString("id-ID")} {item.unit}
            </span>
            {item.minStockAlert != null
              ? ` · Ambang batas: ${item.minStockAlert.toLocaleString("id-ID")} ${item.unit}`
              : " · Tanpa ambang batas"}
          </span>
        </div>
        <Button onClick={() => setAdjustOpen(true)}>
          <Plus className="size-4" />
          Penyesuaian stok
        </Button>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Stok per lokasi
        </h2>
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          {item.stockByLocation.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Belum ada stok tercatat. Gunakan Penyesuaian stok untuk stok awal.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Lokasi</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {item.stockByLocation.map((s) => (
                  <TableRow key={s.locationId}>
                    <TableCell>{s.locationName}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {s.quantity.toLocaleString("id-ID")} {item.unit}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Kartu stok (riwayat mutasi)
        </h2>
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          {item.mutations.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Belum ada mutasi stok.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {item.mutations.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>{formatDate(m.mutationDate)}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        <Badge
                          variant={m.direction === "IN" ? "outline" : "secondary"}
                        >
                          {m.direction === "IN" ? "Masuk" : "Keluar"}
                        </Badge>
                        {mutationTypeLabel(m.mutationType)}
                      </span>
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right tabular-nums font-medium",
                        m.direction === "IN"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-destructive",
                      )}
                    >
                      {m.direction === "IN" ? "+" : "−"}
                      {m.quantity.toLocaleString("id-ID")} {item.unit}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </section>

      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Penyesuaian stok — {item.name}</DialogTitle>
          </DialogHeader>
          <form action={action}>
            <input type="hidden" name="itemId" value={item.id} />
            <input type="hidden" name="locationId" value={locationId} />
            <input type="hidden" name="direction" value={direction} />
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="adjust-location">Lokasi</FieldLabel>
                <Select value={locationId} onValueChange={setLocationId} required>
                  <SelectTrigger id="adjust-location">
                    <SelectValue placeholder="Pilih lokasi" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="adjust-direction">Arah</FieldLabel>
                <Select
                  value={direction}
                  onValueChange={(v) => setDirection(v as "IN" | "OUT")}
                  required
                >
                  <SelectTrigger id="adjust-direction">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN">Tambah (masuk)</SelectItem>
                    <SelectItem value="OUT">Kurangi (keluar)</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="adjust-quantity">
                  Jumlah ({item.unit})
                </FieldLabel>
                <Input
                  id="adjust-quantity"
                  name="quantity"
                  type="number"
                  step="any"
                  min="0"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="adjust-note">Catatan (opsional)</FieldLabel>
                <Input
                  id="adjust-note"
                  name="note"
                  placeholder="Alasan penyesuaian..."
                />
              </Field>
              {state.error ? <FieldError>{state.error}</FieldError> : null}
            </FieldGroup>
            <DialogFooter className="mt-4">
              <Button type="submit" disabled={pending || !locationId}>
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
