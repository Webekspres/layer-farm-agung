import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MedicalRecordRecapRow } from "@/features/production/services/list-medical-record-recap";

type MedicalRecordRecapTableProps = {
  rows: MedicalRecordRecapRow[];
  recordDateLabel: string;
};

function formatTime(value: Date) {
  return value.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MedicalRecordRecapTable({
  rows,
  recordDateLabel,
}: MedicalRecordRecapTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center text-sm text-muted-foreground">
        Belum ada catatan pengobatan tercatat untuk {recordDateLabel}.
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
            <TableHead>Indikasi</TableHead>
            <TableHead className="text-right">Sakit</TableHead>
            <TableHead className="text-right">Mati</TableHead>
            <TableHead>Obat</TableHead>
            <TableHead>Dosis & Durasi</TableHead>
            <TableHead>Metode</TableHead>
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
              <TableCell>{row.indication}</TableCell>
              <TableCell className="text-right tabular-nums">
                {row.sickPopulation.toLocaleString("id-ID")}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {row.mortalityCount.toLocaleString("id-ID")}
              </TableCell>
              <TableCell>{row.medicineName}</TableCell>
              <TableCell>{row.dosageAndDuration}</TableCell>
              <TableCell>{row.applicationMethod}</TableCell>
              <TableCell className="max-w-[150px] truncate text-muted-foreground">
                {row.treatmentNotes || "-"}
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
