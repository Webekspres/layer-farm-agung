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
import { formatHdpPercent } from "@/features/production/lib/compute-hdp";
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
            <TableHead className="text-right">TB</TableHead>
            <TableHead className="text-right">TR</TableHead>
            <TableHead className="text-right">TP</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">HDP %</TableHead>
            <TableHead>Staff</TableHead>
            <TableHead>Waktu</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const total = row.tb + row.tr + row.tp;
            const defectWarning = crackRatioExceedsThreshold(
              row.tb,
              row.tr,
              row.tp,
            );
            const belowTarget =
              row.hdpPercent !== null &&
              row.targetHdp !== null &&
              row.hdpPercent < row.targetHdp;

            return (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.cageName}</TableCell>
                <TableCell>{row.locationName}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.tb.toLocaleString("id-ID")}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.tr.toLocaleString("id-ID")}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  <span className="inline-flex items-center justify-end gap-2">
                    {row.tp.toLocaleString("id-ID")}
                    {defectWarning ? (
                      <Badge
                        variant="outline"
                        className="border-warning text-warning"
                      >
                        &gt;5%
                      </Badge>
                    ) : null}
                  </span>
                </TableCell>
                <TableCell className="text-right tabular-nums font-medium">
                  {total.toLocaleString("id-ID")}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  <span className="inline-flex items-center justify-end gap-2">
                    {formatHdpPercent(row.hdpPercent)}
                    {belowTarget ? (
                      <Badge
                        variant="outline"
                        className="border-warning text-warning"
                      >
                        &lt; target
                      </Badge>
                    ) : null}
                  </span>
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
