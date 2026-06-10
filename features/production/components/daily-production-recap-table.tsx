import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { crackRatioExceedsThreshold } from "@/features/production/lib/crack-ratio";
import type { DailyProductionRecapRow } from "@/features/production/services/list-daily-production-recap";

type DailyProductionRecapTableProps = {
  rows: DailyProductionRecapRow[];
  recordDateLabel: string;
};

function formatTime(value: Date) {
  return value.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DailyProductionRecapTable({
  rows,
  recordDateLabel,
}: DailyProductionRecapTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center text-sm text-muted-foreground">
        Belum ada produksi tercatat untuk {recordDateLabel}.
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
            <TableHead>Grade</TableHead>
            <TableHead className="text-right">Layak</TableHead>
            <TableHead className="text-right">Pecah</TableHead>
            <TableHead className="text-right">Berat (kg)</TableHead>
            <TableHead>Staff</TableHead>
            <TableHead>Waktu</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const crackWarning = crackRatioExceedsThreshold(
              row.quantity,
              row.eggCrack,
            );

            return (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.cageName}</TableCell>
                <TableCell>{row.locationName}</TableCell>
                <TableCell>{row.eggGradeName}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.quantity.toLocaleString("id-ID")}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  <span className="inline-flex items-center justify-end gap-2">
                    {row.eggCrack.toLocaleString("id-ID")}
                    {crackWarning ? (
                      <Badge variant="outline" className="border-warning text-warning">
                        &gt;5%
                      </Badge>
                    ) : null}
                  </span>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.weight != null
                    ? row.weight.toLocaleString("id-ID")
                    : "—"}
                </TableCell>
                <TableCell>{row.recordedBy}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatTime(row.createdAt)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
