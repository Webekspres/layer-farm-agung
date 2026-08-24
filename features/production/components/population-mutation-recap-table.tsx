import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PopulationMutationRecapRow } from "@/features/production/services/list-population-mutation-recap";

type PopulationMutationRecapTableProps = {
  rows: PopulationMutationRecapRow[];
  recordDateLabel: string;
};

function formatTime(value: Date) {
  return value.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PopulationMutationRecapTable({
  rows,
  recordDateLabel,
}: PopulationMutationRecapTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center text-sm text-muted-foreground">
        Belum dilaporkan untuk {recordDateLabel}.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">No</TableHead>
            <TableHead>Kandang</TableHead>
            <TableHead>Lokasi</TableHead>
            <TableHead>Jenis Mutasi</TableHead>
            <TableHead className="text-right">Jumlah (Ekor)</TableHead>
            <TableHead>Catatan</TableHead>
            <TableHead>Staff</TableHead>
            <TableHead>Waktu</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={row.id}>
              <TableCell className="text-muted-foreground tabular-nums">
                {index + 1}
              </TableCell>
              <TableCell className="font-medium">{row.cageName}</TableCell>
              <TableCell>{row.locationName}</TableCell>
              <TableCell>{row.mutationType}</TableCell>
              <TableCell className="text-right tabular-nums">
                {row.quantity.toLocaleString("id-ID")}
              </TableCell>
              <TableCell className="max-w-50 truncate text-muted-foreground">
                {row.notes || "-"}
              </TableCell>
              <TableCell>{row.recordedBy}</TableCell>
              <TableCell className="text-muted-foreground">
                {formatTime(row.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
