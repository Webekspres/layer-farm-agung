"use client";

import { useActionState, useState } from "react";
import { useActionFeedback } from "@/components/shared/action-feedback";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { CustomersToolbar } from "@/features/finance/components/customers-toolbar";
import { masterDataEmptyMessage } from "@/features/master-data/lib/empty-table-message";
import { listFiltersAreActive } from "@/features/master-data/lib/url-list-params";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createCustomerAction,
  type CustomerFormState,
} from "@/features/finance/actions/create-customer";
import type { CustomerListItem } from "@/features/finance/types";
import { TablePagination } from "@/components/shared/table-pagination";
import type { PaginationMeta } from "@/lib/pagination";

const formInitial: CustomerFormState = {};

type CustomersManagementProps = {
  customers: CustomerListItem[];
  pagination: PaginationMeta;
};

export function CustomersManagement({
  customers,
  pagination,
}: CustomersManagementProps) {
  const searchParams = useSearchParams();
  const hasActiveFilter = listFiltersAreActive(searchParams, []);

  const [createOpen, setCreateOpen] = useState(false);

  const [createState, createAction, createPending] = useActionState(
    createCustomerAction,
    formInitial,
  );

  useActionFeedback(createState, {
    successMessage: "Pelanggan berhasil ditambahkan.",
    onSuccess: () => setCreateOpen(false),
    when: createOpen,
  });

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <CustomersToolbar onCreateClick={() => setCreateOpen(true)} />

      <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {customers.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            {masterDataEmptyMessage(
              hasActiveFilter,
              "Belum ada pelanggan. Tambahkan pembeli telur pertama Anda.",
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Nama</TableHead>
                <TableHead>Telepon</TableHead>
                <TableHead>Alamat</TableHead>
                <TableHead className="text-right">Transaksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.phone ?? "—"}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {customer.address ?? "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {customer.salesOrderCount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <TablePagination {...pagination} entityName="pelanggan" />
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah pelanggan</DialogTitle>
          </DialogHeader>
          <form action={createAction}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="customer-name">Nama pelanggan</FieldLabel>
                <Input id="customer-name" name="name" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="customer-phone">
                  Telepon (opsional)
                </FieldLabel>
                <Input id="customer-phone" name="phone" placeholder="08xx..." />
              </Field>
              <Field>
                <FieldLabel htmlFor="customer-address">
                  Alamat (opsional)
                </FieldLabel>
                <Input id="customer-address" name="address" />
              </Field>
              {createState.error ? (
                <FieldError>{createState.error}</FieldError>
              ) : null}
            </FieldGroup>
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
    </div>
  );
}
