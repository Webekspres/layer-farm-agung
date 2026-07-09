"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  calendarDateToRecordDate,
  formatProductionDatePickerLabel,
  formatProductionDateParam,
  isProductionToday,
  isCalendarDateAfterBusinessToday,
  parseProductionRecordDate,
  recordDateToCalendarDate,
  shiftProductionDate,
  startOfTodayUtc,
} from "@/features/production/lib/parse-production-date";
import { cn } from "@/lib/utils";

export function ProductionDateToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const recordDate = parseProductionRecordDate(searchParams.get("date"));
  const viewingToday = isProductionToday(recordDate);

  function navigateTo(date: Date | undefined) {
    if (!date) return;
    const recordDate = calendarDateToRecordDate(date);
    const next = new URLSearchParams(searchParams.toString());
    const param = formatProductionDateParam(recordDate);

    if (isProductionToday(recordDate)) {
      next.delete("date");
    } else {
      next.set("date", param);
    }

    const query = next.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname);
    });
  }

  const calendarDate = recordDateToCalendarDate(recordDate);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        {/* Tombol Hari Sebelumnya */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Hari sebelumnya"
          onClick={() =>
            navigateTo(
              recordDateToCalendarDate(shiftProductionDate(recordDate, -1)),
            )
          }
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
                formatProductionDatePickerLabel(recordDate)
              ) : (
                <span>Pilih tanggal</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={calendarDate}
              onSelect={navigateTo}
              // Mengunci tanggal masa depan agar staff tidak bisa melihat rekap esok hari
              disabled={(date) =>
                isCalendarDateAfterBusinessToday(date) ||
                date < new Date("1900-01-01")
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
          onClick={() =>
            navigateTo(
              recordDateToCalendarDate(shiftProductionDate(recordDate, 1)),
            )
          }
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {/* Tombol Kembali Ke Hari Ini */}
      {!viewingToday ? (
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigateTo(recordDateToCalendarDate(startOfTodayUtc()))}
        >
          Kembali ke hari ini
        </Button>
      ) : null}
    </div>
  );
}
