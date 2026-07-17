"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StockMutationsToolbar } from "@/features/inventory/components/stock-mutations-toolbar";
import { masterDataEmptyMessage } from "@/features/master-data/lib/empty-table-message";
import { listFiltersAreActive } from "@/features/master-data/lib/url-list-params";
import { mutationTypeLabel } from "@/features/inventory/lib/mutation-type-labels";
import type { StockMutationListItem } from "@/features/inventory/types";
import { TablePagination } from "@/components/shared/table-pagination";
import type { PaginationMeta } from "@/lib/pagination";
import { cn } from "@/lib/utils";

type StockMutationsManagementProps = {
  mutations: StockMutationListItem[];
  pagination: PaginationMeta;
  locations: { id: string; name: string }[];
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function StockMutationsManagement({
  mutations,
  pagination,
  locations,
}: StockMutationsManagementProps) {
  const searchParams = useSearchParams();
  const hasActiveFilter = listFiltersAreActive(searchParams, [
    "type",
    "location",
    "from",
    "to",
  ]);

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <StockMutationsToolbar locations={locations} />

      <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {mutations.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            {masterDataEmptyMessage(
              hasActiveFilter,
              "Belum ada mutasi stok tercatat.",
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Tanggal</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mutations.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{formatDate(m.mutationDate)}</TableCell>
                  <TableCell className="font-medium">
                    <Link
                      href={`/dashboard/inventory/${m.itemId}`}
                      className="hover:underline"
                    >
                      {m.itemName}
                    </Link>
                  </TableCell>
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
                    {m.quantity.toLocaleString("id-ID")} {m.unit}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <TablePagination {...pagination} entityName="mutasi" />
      </div>
    </div>
  );
}
