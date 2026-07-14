"use client";

import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  businessDateToCalendarPick,
  calendarPickToBusinessDate,
  formatBusinessDate,
  formatBusinessDatePickerLabel,
  isCalendarPickAfterTodayBusiness,
  startOfTodayBusiness,
} from "@/lib/business-date";
import { cn } from "@/lib/utils";

type RecordDatePickerProps = {
  value: Date;
  onChange: (date: Date) => void;
  id?: string;
  className?: string;
  placeholder?: string;
  /** When true, dates after today WIB cannot be selected. */
  disableFuture?: boolean;
};

export function RecordDatePicker({
  value,
  onChange,
  id,
  className,
  placeholder = "Pilih tanggal",
  disableFuture = true,
}: RecordDatePickerProps) {
  const calendarDate = businessDateToCalendarPick(value);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          id={id}
          variant="outline"
          className={cn(
            "w-full justify-start pl-3 text-left font-normal",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2.5 size-4 shrink-0 text-muted-foreground" />
          {value ? (
            formatBusinessDatePickerLabel(value)
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={calendarDate}
          onSelect={(date) => {
            if (date) onChange(calendarPickToBusinessDate(date));
          }}
          disabled={(date) => {
            if (date < new Date("1900-01-01")) return true;
            if (disableFuture) return isCalendarPickAfterTodayBusiness(date);
            return false;
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

type RecordDateHiddenInputProps = {
  name: string;
  value: Date;
};

/** Hidden `YYYY-MM-DD` field for Server Actions / forms. */
export function RecordDateHiddenInput({ name, value }: RecordDateHiddenInputProps) {
  return (
    <input type="hidden" name={name} value={formatBusinessDate(value)} />
  );
}

export function todayRecordDateValue() {
  return startOfTodayBusiness();
}
