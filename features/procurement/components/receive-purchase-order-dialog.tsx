"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import { useActionFeedback } from "@/components/shared/action-feedback";
import { Loader2 } from "lucide-react";
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
  receivePurchaseOrderAction,
  type ReceivePurchaseOrderFormState,
} from "@/features/procurement/actions/receive-purchase-order";

const formInitial: ReceivePurchaseOrderFormState = {};

export type ReceivableLine = {
  itemId: string;
  itemName: string;
  itemUnit: string;
  remaining: number;
};

type ReceivePurchaseOrderDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  poId: string;
  vendorName: string;
  locations: { id: string; name: string }[];
  /**
   * Remaining quantity per line. When provided, staff can adjust each amount
   * to do a partial receive. When omitted, the whole remaining PO is received.
   */
  lines?: ReceivableLine[];
};

export function ReceivePurchaseOrderDialog({
  open,
  onOpenChange,
  poId,
  vendorName,
  locations,
  lines,
}: ReceivePurchaseOrderDialogProps) {
  const router = useRouter();
  const [locationId, setLocationId] = useState(locations[0]?.id ?? "");
  const [quantities, setQuantities] = useState<Record<string, string>>({});

  const [state, action, pending] = useActionState(
    receivePurchaseOrderAction,
    formInitial,
  );

  // Reset the form fields whenever the dialog transitions to open, without a
  // useEffect: this is React's recommended "adjust state during render"
  // pattern for resetting local state in response to a prop change.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setLocationId(locations[0]?.id ?? "");
      setQuantities(
        lines
          ? Object.fromEntries(lines.map((l) => [l.itemId, String(l.remaining)]))
          : {},
      );
    }
  }

  useActionFeedback(state, {
    successMessage: "Barang berhasil diterima. Stok inventori telah diperbarui.",
    onSuccess: () => {
      onOpenChange(false);
      router.refresh();
    },
    when: open,
  });

  const itemsJson = lines
    ? JSON.stringify(
        lines
          .filter((line) => Number(quantities[line.itemId] ?? 0) > 0)
          .map((line) => ({
            itemId: line.itemId,
            quantity: Number(quantities[line.itemId] ?? 0),
          })),
      )
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Terima barang — {vendorName}</DialogTitle>
        </DialogHeader>
        <form action={action}>
          <input type="hidden" name="poId" value={poId} />
          <input type="hidden" name="locationId" value={locationId} />
          {itemsJson !== undefined ? (
            <input type="hidden" name="itemsJson" value={itemsJson} />
          ) : null}
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="receive-location">
                Lokasi penerimaan stok
              </FieldLabel>
              <Select value={locationId} onValueChange={setLocationId} required>
                <SelectTrigger id="receive-location">
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

            {lines ? (
              <div className="flex flex-col gap-2">
                <FieldLabel>Jumlah diterima per barang</FieldLabel>
                <div className="flex max-h-[min(40vh,280px)] flex-col gap-2 overflow-y-auto rounded-lg border border-border bg-muted/20 p-2">
                  {lines.map((line) => (
                    <div
                      key={line.itemId}
                      className="flex items-center gap-2 rounded-md border border-border bg-card p-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {line.itemName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Sisa: {line.remaining.toLocaleString("id-ID")}{" "}
                          {line.itemUnit}
                        </p>
                      </div>
                      <Input
                        type="number"
                        min="0"
                        max={line.remaining}
                        step="any"
                        className="w-28 shrink-0"
                        value={quantities[line.itemId] ?? ""}
                        onChange={(e) =>
                          setQuantities((prev) => ({
                            ...prev,
                            [line.itemId]: e.target.value,
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Kosongkan atau isi 0 untuk barang yang belum diterima kali ini.
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Semua sisa barang pada PO ini akan ditambahkan ke stok lokasi
                terpilih dengan jenis mutasi Pembelian.
              </p>
            )}

            {state.error ? <FieldError>{state.error}</FieldError> : null}
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button
              type="submit"
              disabled={pending || !locationId || locations.length === 0}
            >
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              Konfirmasi terima
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
