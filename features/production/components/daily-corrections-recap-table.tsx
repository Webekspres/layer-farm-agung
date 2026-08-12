import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DailyCorrectionRecapRow } from "@/features/production/services/list-daily-corrections-recap";

type DailyCorrectionsRecapTableProps = {
  rows: DailyCorrectionRecapRow[];
  recordDateLabel: string;
};

const COMPONENT_LABEL: Record<string, string> = {
  production: "Produksi",
  feed: "Pakan",
  population: "Populasi",
  medical: "Pengobatan",
};

function formatValue(value: string | number | null) {
  if (value == null) return "—";
  if (typeof value === "number") return value.toLocaleString("id-ID");
  return value;
}

function formatTime(value: Date) {
  return value.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DailyCorrectionsRecapTable({
  rows,
  recordDateLabel,
}: DailyCorrectionsRecapTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center text-sm text-muted-foreground">
        Belum ada koreksi untuk {recordDateLabel}.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Waktu</TableHead>
            <TableHead>Kandang</TableHead>
            <TableHead>Pelaku</TableHead>
            <TableHead>Alasan</TableHead>
            <TableHead>Perubahan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="text-muted-foreground whitespace-nowrap">
                {formatTime(row.createdAt)}
              </TableCell>
              <TableCell className="font-medium">{row.cageName}</TableCell>
              <TableCell>{row.actorName}</TableCell>
              <TableCell className="max-w-xs">{row.reason}</TableCell>
              <TableCell>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {row.changes.map((change, index) => (
                    <li key={`${row.id}-${change.field}-${index}`}>
                      {COMPONENT_LABEL[change.component] ?? change.component} ·{" "}
                      {change.field}: {formatValue(change.before)} →{" "}
                      {formatValue(change.after)}
                    </li>
                  ))}
                </ul>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
