import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { eggMutationTypeLabel } from "@/features/eggs/lib/egg-mutation-type-labels";
import type { EggStockGradeDetail } from "@/features/eggs/types";
import { cn } from "@/lib/utils";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function EggStockDetailView({ detail }: { detail: EggStockGradeDetail }) {
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-4 py-3 text-sm font-medium">
          Stok per lokasi
        </div>
        {detail.stockByLocation.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            Belum ada stok grade ini di lokasi mana pun.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-12">No</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead className="text-right">Stok</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detail.stockByLocation.map((stock, index) => (
                <TableRow key={stock.locationId}>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-medium">
                    {stock.locationName}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {stock.quantity.toLocaleString("id-ID")} butir
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-4 py-3 text-sm font-medium">
          Kartu stok
        </div>
        {detail.movements.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            Belum ada mutasi stok untuk grade ini.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-12">No</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detail.movements.map((movement, index) => (
                <TableRow key={movement.id}>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {index + 1}
                  </TableCell>
                  <TableCell>{formatDate(movement.mutationDate)}</TableCell>
                  <TableCell>{movement.locationName}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      <Badge
                        variant={
                          movement.direction === "IN" ? "outline" : "secondary"
                        }
                      >
                        {movement.direction === "IN" ? "Masuk" : "Keluar"}
                      </Badge>
                      {eggMutationTypeLabel(movement.mutationType)}
                    </span>
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right tabular-nums font-medium",
                      movement.direction === "IN"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-destructive",
                    )}
                  >
                    {movement.direction === "IN" ? "+" : "−"}
                    {movement.quantity.toLocaleString("id-ID")} butir
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}