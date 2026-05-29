"use client";

import { useActionState, useState } from "react";
import { useActionFeedback } from "@/components/shared/action-feedback";
import { useSearchParams } from "next/navigation";
import { Loader2, Pencil } from "lucide-react";
import { VendorsToolbar } from "@/features/vendors/components/vendors-toolbar";
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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createVendorAction,
  type VendorFormState,
} from "@/features/vendors/actions/create-vendor";
import { updateVendorAction } from "@/features/vendors/actions/update-vendor";
import { vendorCategories } from "@/features/vendors/schemas/vendor";
import type { VendorListItem } from "@/features/vendors/types";
import { TablePagination } from "@/components/shared/table-pagination";
import type { PaginationMeta } from "@/lib/pagination";

const formInitial: VendorFormState = {};

type VendorsManagementProps = {
  vendors: VendorListItem[];
  pagination: PaginationMeta;
};

function VendorFields({
  category,
  onCategoryChange,
  editing,
  error,
}: {
  category: string;
  onCategoryChange: (value: string) => void;
  editing?: VendorListItem | null;
  error?: string;
}) {
  return (
    <FieldGroup>
      <input type="hidden" name="category" value={category} />
      <Field>
        <FieldLabel htmlFor="vendor-name">Nama vendor</FieldLabel>
        <Input
          id="vendor-name"
          name="name"
          defaultValue={editing?.name}
          required
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="vendor-category">Kategori</FieldLabel>
        <Select value={category} onValueChange={onCategoryChange} required>
          <SelectTrigger id="vendor-category">
            <SelectValue placeholder="Pilih kategori" />
          </SelectTrigger>
          <SelectContent>
            {vendorCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel htmlFor="vendor-pic-name">Nama PIC (opsional)</FieldLabel>
        <Input
          id="vendor-pic-name"
          name="picName"
          defaultValue={editing?.picName ?? ""}
          placeholder="Nama contact person..."
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="vendor-pic-phone">Telepon PIC (opsional)</FieldLabel>
        <Input
          id="vendor-pic-phone"
          name="picPhone"
          defaultValue={editing?.picPhone ?? ""}
          placeholder="No. telepon contact person..."
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="vendor-address">Alamat (opsional)</FieldLabel>
        <Textarea
          id="vendor-address"
          name="address"
          rows={2}
          defaultValue={editing?.address ?? ""}
        />
      </Field>
      {error ? <FieldError>{error}</FieldError> : null}
    </FieldGroup>
  );
}

export function VendorsManagement({
  vendors,
  pagination,
}: VendorsManagementProps) {
  const searchParams = useSearchParams();
  const hasActiveFilter = listFiltersAreActive(searchParams, ["category"]);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<VendorListItem | null>(null);
  const [createCategory, setCreateCategory] = useState<string>(
    vendorCategories[0],
  );
  const [editCategory, setEditCategory] = useState<string>(vendorCategories[0]);

  const [createState, createAction, createPending] = useActionState(
    createVendorAction,
    formInitial,
  );
  const [updateState, updateAction, updatePending] = useActionState(
    updateVendorAction,
    formInitial,
  );

  useActionFeedback(createState, {
    successMessage: "Vendor berhasil ditambahkan.",
    onSuccess: () => setCreateOpen(false),
    when: createOpen,
  });

  useActionFeedback(updateState, {
    successMessage: "Vendor berhasil diperbarui.",
    onSuccess: () => setEditOpen(false),
    when: editOpen,
  });

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <VendorsToolbar onCreateClick={() => setCreateOpen(true)} />

      <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {vendors.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            {masterDataEmptyMessage(
              hasActiveFilter,
              "Belum ada vendor. Tambahkan pemasok pakan, obat, atau perlengkapan.",
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Nama</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>PIC / Telepon</TableHead>
                <TableHead>PO</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell className="font-medium">{vendor.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{vendor.category}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {vendor.picName ? (
                      <span className="block text-foreground font-medium">
                        {vendor.picName}
                        {vendor.picPhone && (
                          <span className="block text-xs text-muted-foreground">
                            {vendor.picPhone}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>{vendor.purchaseOrderCount}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        setEditing(vendor);
                        setEditCategory(vendor.category);
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
        <TablePagination {...pagination} entityName="vendor" />
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah vendor</DialogTitle>
          </DialogHeader>
          <form action={createAction}>
            <VendorFields
              category={createCategory}
              onCategoryChange={setCreateCategory}
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
            <DialogTitle>Edit vendor</DialogTitle>
          </DialogHeader>
          {editing ? (
            <form action={updateAction}>
              <input type="hidden" name="id" value={editing.id} />
              <VendorFields
                category={editCategory}
                onCategoryChange={setEditCategory}
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
