import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { FeedConsumptionRecapRow } from "@/features/production/services/list-feed-consumption-recap";

type FeedConsumptionRecapTableProps = {
  rows: FeedConsumptionRecapRow[];
  recordDateLabel: string;
};

function formatTime(value: Date) {
  return value.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function FeedConsumptionRecapTable({
  rows,
  recordDateLabel,
}: FeedConsumptionRecapTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center text-sm text-muted-foreground">
        Belum ada konsumsi pakan tercatat untuk {recordDateLabel}.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kandang</TableHead>
            <TableHead>Lokasi</TableHead>
            <TableHead>Jenis Pakan</TableHead>
            <TableHead className="text-right">Jumlah</TableHead>
            <TableHead>Satuan</TableHead>
            <TableHead>Catatan</TableHead>
            <TableHead>Staff</TableHead>
            <TableHead>Waktu</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{row.cageName}</TableCell>
              <TableCell>{row.locationName}</TableCell>
              <TableCell>{row.itemName}</TableCell>
              <TableCell className="text-right tabular-nums">
                {row.quantity.toLocaleString("id-ID")}
              </TableCell>
              <TableCell>{row.itemUnit}</TableCell>
              <TableCell className="max-w-[200px] truncate text-muted-foreground">
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
