"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RecordDatePicker } from "@/components/shared/record-date-picker";
import { buildListSearchParams } from "@/features/master-data/lib/url-list-params";
import {
  formatBusinessDate,
  tryParseBusinessDate,
} from "@/lib/business-date";
import {
  CASHFLOW_TYPES,
  CASHFLOW_TYPE_LABELS,
} from "@/features/finance/lib/cashflow-labels";

type CashflowToolbarProps = {
  onCreateExpenseClick: () => void;
};

export function CashflowToolbar({ onCreateExpenseClick }: CashflowToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const dateFrom = tryParseBusinessDate(searchParams.get("dateFrom"));
  const dateTo = tryParseBusinessDate(searchParams.get("dateTo"));
  const type = searchParams.get("type") ?? "all";

  function updateParam(key: string, value: string | undefined) {
    const next = buildListSearchParams(searchParams, { [key]: value });
    next.delete("page");
    startTransition(() => {
      router.replace(`${pathname}?${next.toString()}`);
    });
  }

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
      <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-3 lg:flex lg:flex-row lg:flex-wrap lg:items-center">
        <RecordDatePicker
          value={dateFrom ?? undefined}
          onChange={(date) => updateParam("dateFrom", formatBusinessDate(date))}
          placeholder="Dari tanggal"
          disableFuture={false}
          className="w-full sm:w-40"
        />
        <RecordDatePicker
          value={dateTo ?? undefined}
          onChange={(date) => updateParam("dateTo", formatBusinessDate(date))}
          placeholder="Sampai tanggal"
          disableFuture={false}
          className="w-full sm:w-40"
        />
        <Select value={type} onValueChange={(v) => updateParam("type", v)}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Jenis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua jenis</SelectItem>
            {CASHFLOW_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {CASHFLOW_TYPE_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        onClick={onCreateExpenseClick}
        className="w-full shrink-0 sm:w-auto lg:self-center"
      >
        <Plus className="size-4" />
        Catat pengeluaran
      </Button>
    </div>
  );
}
