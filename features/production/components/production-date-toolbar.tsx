"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  const viewingToday = isProductionToday(recordDate);

  function navigateTo(date: Date | undefined) {
    if (!date) return;
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
        {/* Tombol Hari Sebelumnya */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Hari sebelumnya"
          onClick={() => navigateTo(shiftProductionDate(recordDate, -1))}
        >
          <ChevronLeft className="size-4" />
        </Button>

        {/* Shadcn Popover + Calendar UI Modern */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-56 justify-start text-left font-normal pl-3",
                !recordDate && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2.5 size-4 text-muted-foreground" />
              {recordDate ? (
                format(recordDate, "dd MMMM yyyy", { locale: id })
              ) : (
                <span>Pilih tanggal</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={recordDate}
              onSelect={navigateTo}
              // Mengunci tanggal masa depan agar staff tidak bisa melihat rekap esok hari
              disabled={(date) =>
                date > new Date() || date < new Date("1900-01-01")
              }
            />
          </PopoverContent>
        </Popover>

        {/* Tombol Hari Berikutnya */}
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

      {/* Tombol Kembali Ke Hari Ini */}
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
