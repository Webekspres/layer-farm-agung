"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  formatProductionDateParam,
  isProductionToday,
  parseProductionRecordDate,
  shiftProductionDate,
} from "@/features/production/lib/parse-production-date";

export function ProductionDateToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const recordDate = parseProductionRecordDate(searchParams.get("date"));
  const dateParam = formatProductionDateParam(recordDate);
  const viewingToday = isProductionToday(recordDate);

  function navigateTo(date: Date) {
    const next = new URLSearchParams(searchParams.toString());
    const param = formatProductionDateParam(date);

    if (isProductionToday(date)) {
      next.delete("date");
    } else {
      next.set("date", param);
    }

    const query = next.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname);
    });
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Hari sebelumnya"
          onClick={() => navigateTo(shiftProductionDate(recordDate, -1))}
        >
          <ChevronLeft className="size-4" />
        </Button>

        <div className="relative min-w-[10.5rem]">
          <CalendarDays className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="date"
            value={dateParam}
            max={formatProductionDateParam(new Date())}
            className="pl-9"
            aria-label="Pilih tanggal rekap"
            onChange={(event) => {
              if (!event.target.value) return;
              navigateTo(parseProductionRecordDate(event.target.value));
            }}
          />
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Hari berikutnya"
          disabled={viewingToday}
          onClick={() => navigateTo(shiftProductionDate(recordDate, 1))}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {!viewingToday ? (
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigateTo(new Date())}
        >
          Kembali ke hari ini
        </Button>
      ) : null}
    </div>
  );
}
