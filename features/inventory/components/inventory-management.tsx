"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useActionFeedback } from "@/components/shared/action-feedback";
import { useSearchParams } from "next/navigation";
import { Loader2, Pencil } from "lucide-react";
import { InventoryToolbar } from "@/features/inventory/components/inventory-toolbar";
import { masterDataEmptyMessage } from "@/features/master-data/lib/empty-table-message";
import { listFiltersAreActive } from "@/features/master-data/lib/url-list-params";
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
  createItemAction,
  type ItemFormState,
} from "@/features/inventory/actions/create-item";
import { updateItemAction } from "@/features/inventory/actions/update-item";
import {
  ITEM_TYPE_LABELS,
  ITEM_TYPE_VALUES,
} from "@/features/inventory/lib/item-type-labels";
import type { ItemListItem } from "@/features/inventory/types";
import { TablePagination } from "@/components/shared/table-pagination";
import type { PaginationMeta } from "@/lib/pagination";
import { cn } from "@/lib/utils";

const formInitial: ItemFormState = {};

type InventoryManagementProps = {
  items: ItemListItem[];
  pagination: PaginationMeta;
};

function ItemFields({
  type,
  onTypeChange,
  editing,
  error,
}: {
  type: string;
  onTypeChange: (value: string) => void;
  editing?: ItemListItem | null;
  error?: string;
}) {
  return (
    <FieldGroup>
      <input type="hidden" name="type" value={type} />
      <Field>
        <FieldLabel htmlFor="item-name">Nama item</FieldLabel>
        <Input id="item-name" name="name" defaultValue={editing?.name} required />
      </Field>
      <Field>
        <FieldLabel htmlFor="item-type">Tipe</FieldLabel>
        <Select value={type} onValueChange={onTypeChange} required>
          <SelectTrigger id="item-type">
            <SelectValue placeholder="Pilih tipe" />
          </SelectTrigger>
          <SelectContent>
            {ITEM_TYPE_VALUES.map((t) => (
              <SelectItem key={t} value={t}>
                {ITEM_TYPE_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel htmlFor="item-unit">Satuan</FieldLabel>
        <Input
          id="item-unit"
          name="unit"
          defaultValue={editing?.unit}
          placeholder="mis. kg, gram, ml, butir, liter"
          required
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="item-min-stock">
          Ambang batas stok rendah (opsional)
        </FieldLabel>
        <Input
          id="item-min-stock"
          name="minStockAlert"
          type="number"
          step="any"
          min="0"
          defaultValue={editing?.minStockAlert ?? ""}
          placeholder="Kosongkan bila tidak ada peringatan"
        />
      </Field>
      {error ? <FieldError>{error}</FieldError> : null}
    </FieldGroup>
  );
}

export function InventoryManagement({
  items,
  pagination,
}: InventoryManagementProps) {
  const searchParams = useSearchParams();
  const hasActiveFilter = listFiltersAreActive(searchParams, ["type"]);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<ItemListItem | null>(null);
  const [createType, setCreateType] = useState<string>(ITEM_TYPE_VALUES[0]);
  const [editType, setEditType] = useState<string>(ITEM_TYPE_VALUES[0]);

  const [createState, createAction, createPending] = useActionState(
    createItemAction,
    formInitial,
  );
  const [updateState, updateAction, updatePending] = useActionState(
    updateItemAction,
    formInitial,
  );

  useActionFeedback(createState, {
    successMessage: "Item berhasil ditambahkan.",
    onSuccess: () => setCreateOpen(false),
    when: createOpen,
  });

  useActionFeedback(updateState, {
    successMessage: "Item berhasil diperbarui.",
    onSuccess: () => setEditOpen(false),
    when: editOpen,
  });

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <InventoryToolbar onCreateClick={() => setCreateOpen(true)} />

      <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {items.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            {masterDataEmptyMessage(
              hasActiveFilter,
              "Belum ada item. Daftarkan pakan, obat, vitamin, atau item lain.",
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Nama</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Satuan</TableHead>
                <TableHead className="text-right">Stok</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/dashboard/inventory/${item.id}`}
                      className="hover:underline"
                    >
                      {item.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {ITEM_TYPE_LABELS[item.type]}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        "tabular-nums",
                        item.lowStock && "font-semibold text-destructive",
                      )}
                    >
                      {item.totalQuantity.toLocaleString("id-ID")}
                    </span>
                    {item.lowStock ? (
                      <Badge variant="destructive" className="ml-2">
                        Stok rendah
                      </Badge>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        setEditing(item);
                        setEditType(item.type);
                        setEditOpen(true);
                      }}
                    >
                      <Pencil className="size-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <TablePagination {...pagination} entityName="item" />
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah item</DialogTitle>
          </DialogHeader>
          <form action={createAction}>
            <ItemFields
              type={createType}
              onTypeChange={setCreateType}
              error={createState.error}
            />
            <DialogFooter className="mt-4">
              <Button type="submit" disabled={createPending}>
                {createPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit item</DialogTitle>
          </DialogHeader>
          {editing ? (
            <form action={updateAction}>
              <input type="hidden" name="id" value={editing.id} />
              <ItemFields
                type={editType}
                onTypeChange={setEditType}
                editing={editing}
                error={updateState.error}
              />
              <DialogFooter className="mt-4">
                <Button type="submit" disabled={updatePending}>
                  {updatePending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  Simpan
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
