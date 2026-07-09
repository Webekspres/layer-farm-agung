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

type ReceivePurchaseOrderDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  poId: string;
  vendorName: string;
  locations: { id: string; name: string }[];
};

export function ReceivePurchaseOrderDialog({
  open,
  onOpenChange,
  poId,
  vendorName,
  locations,
}: ReceivePurchaseOrderDialogProps) {
  const router = useRouter();
  const [locationId, setLocationId] = useState(locations[0]?.id ?? "");

  const [state, action, pending] = useActionState(
    receivePurchaseOrderAction,
    formInitial,
  );

  useActionFeedback(state, {
    successMessage: "Barang berhasil diterima. Stok inventori telah diperbarui.",
    onSuccess: () => {
      onOpenChange(false);
      router.refresh();
    },
    when: open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Terima barang — {vendorName}</DialogTitle>
        </DialogHeader>
        <form action={action}>
          <input type="hidden" name="poId" value={poId} />
          <input type="hidden" name="locationId" value={locationId} />
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
            <p className="text-sm text-muted-foreground">
              Semua barang pada PO ini akan ditambahkan ke stok lokasi terpilih
              dengan jenis mutasi Pembelian.
            </p>
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
