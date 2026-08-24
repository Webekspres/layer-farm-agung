import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { EggStockGradeRow } from "@/features/eggs/types";

type EggStockManagementProps = {
  grades: EggStockGradeRow[];
};

export function EggStockManagement({ grades }: EggStockManagementProps) {
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {grades.length === 0 ? (
        <div className="p-10 text-center text-sm text-muted-foreground">
          Belum ada grade telur aktif. Hubungi superadmin untuk menambahkan
          klasifikasi telur.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-12">No</TableHead>
              <TableHead className="w-24">Kode</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead className="text-right">Total stok</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grades.map((grade, index) => (
              <TableRow key={grade.gradeId}>
                <TableCell className="text-muted-foreground tabular-nums">
                  {index + 1}
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm text-muted-foreground">
                    {grade.code ?? "—"}
                  </span>
                </TableCell>
                <TableCell className="font-medium">
                  <Link
                    href={`/dashboard/inventory/eggs/${grade.gradeId}`}
                    className="hover:underline"
                  >
                    {grade.name}
                  </Link>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {grade.totalQuantity.toLocaleString("id-ID")} butir
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}