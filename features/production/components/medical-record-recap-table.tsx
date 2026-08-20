import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { isMedicalNoneReport } from "@/features/production/schemas/medical-record";
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
          {rows.map((row, index) => {
            const noneReport = isMedicalNoneReport(row);

            return (
              <TableRow key={row.id}>
                <TableCell className="text-muted-foreground tabular-nums">
                  {index + 1}
                </TableCell>
                <TableCell className="font-medium">{row.cageName}</TableCell>
                <TableCell>{row.locationName}</TableCell>
                {noneReport ? (
                  <TableCell
                    colSpan={7}
                    className="font-medium text-muted-foreground"
                  >
                    Tidak ada pengobatan
                  </TableCell>
                ) : (
                  <>
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
                    <TableCell className="max-w-37.5 truncate text-muted-foreground">
                      {row.treatmentNotes || "-"}
                    </TableCell>
                  </>
                )}
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
