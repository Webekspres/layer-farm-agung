import { z } from "zod";

import {
  BUSINESS_TIMEZONE,
  businessDateFromInstant,
  businessDateFromParts,
  formatInstantInBusinessTimezone,
  type BusinessCalendarParts,
} from "@/lib/business-timezone";

export { BUSINESS_TIMEZONE, type BusinessCalendarParts };

/** Canonical wire format: `YYYY-MM-DD` (WIB operational calendar day). */
export type BusinessDateString = string;

export const BUSINESS_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const INVALID_BUSINESS_DATE_MESSAGE = "Tanggal tidak valid.";
const FUTURE_BUSINESS_DATE_MESSAGE = "Tanggal tidak boleh di masa depan.";

/** Normalize any Date to stored business date (UTC midnight, same Y-M-D). */
export function normalizeBusinessDate(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

/** @deprecated Use `normalizeBusinessDate`. */
export const startOfUtcDate = normalizeBusinessDate;

/** Today's WIB operational calendar day as stored business date. */
export function startOfTodayBusiness(now = new Date()): Date {
  return businessDateFromInstant(now);
}

/** @deprecated Use `startOfTodayBusiness`. */
export const startOfTodayUtc = startOfTodayBusiness;

/** Stored business date → `YYYY-MM-DD` for API, forms, and URLs. */
export function formatBusinessDate(date: Date): BusinessDateString {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** @deprecated Use `formatBusinessDate`. */
export const formatProductionDateParam = formatBusinessDate;

/** Format Prisma `@db.Date` / stored business date for API responses. */
export function formatBusinessDateFromDb(date: Date): BusinessDateString {
  return formatBusinessDate(normalizeBusinessDate(date));
}

/** Parse strict `YYYY-MM-DD` to stored business date. */
export function parseBusinessDate(value: BusinessDateString): Date {
  if (!BUSINESS_DATE_RE.test(value)) {
    throw new Error(INVALID_BUSINESS_DATE_MESSAGE);
  }

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new Error(INVALID_BUSINESS_DATE_MESSAGE);
  }

  return parsed;
}

export function tryParseBusinessDate(
  value: string | null | undefined,
): Date | null {
  if (!value || !BUSINESS_DATE_RE.test(value)) {
    return null;
  }

  try {
    return parseBusinessDate(value);
  } catch {
    return null;
  }
}

export function parseBusinessDateParam(
  param: string | null | undefined,
  now = new Date(),
): Date {
  const parsed = tryParseBusinessDate(param);
  return parsed ?? startOfTodayBusiness(now);
}

/** @deprecated Use `parseBusinessDateParam`. */
export const parseProductionRecordDate = parseBusinessDateParam;

export function formatBusinessDateLabel(date: Date): string {
  return formatInstantInBusinessTimezone(date, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** @deprecated Use `formatBusinessDateLabel`. */
export const formatProductionDateLabel = formatBusinessDateLabel;

export function formatBusinessDatePickerLabel(date: Date): string {
  return formatInstantInBusinessTimezone(date, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** @deprecated Use `formatBusinessDatePickerLabel`. */
export const formatProductionDatePickerLabel = formatBusinessDatePickerLabel;

/** react-day-picker selection → stored business date. */
export function calendarPickToBusinessDate(date: Date): Date {
  return businessDateFromParts({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  });
}

/** @deprecated Use `calendarPickToBusinessDate`. */
export const calendarDateToRecordDate = calendarPickToBusinessDate;

/** Stored business date → react-day-picker `selected` value. */
export function businessDateToCalendarPick(date: Date): Date {
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );
}

/** @deprecated Use `businessDateToCalendarPick`. */
export const recordDateToCalendarDate = businessDateToCalendarPick;

export function shiftBusinessDate(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return normalizeBusinessDate(next);
}

/** @deprecated Use `shiftBusinessDate`. */
export const shiftProductionDate = shiftBusinessDate;

export function isTodayBusiness(date: Date, now = new Date()): boolean {
  return (
    formatBusinessDate(date) === formatBusinessDate(startOfTodayBusiness(now))
  );
}

/** @deprecated Use `isTodayBusiness`. */
export const isProductionToday = isTodayBusiness;

export function isAfterTodayBusiness(date: Date, now = new Date()): boolean {
  return (
    normalizeBusinessDate(date).getTime() >
    startOfTodayBusiness(now).getTime()
  );
}

export function isCalendarPickAfterTodayBusiness(
  date: Date,
  now = new Date(),
): boolean {
  return calendarPickToBusinessDate(date).getTime() > startOfTodayBusiness(now).getTime();
}

/** @deprecated Use `isCalendarPickAfterTodayBusiness`. */
export const isCalendarDateAfterBusinessToday = isCalendarPickAfterTodayBusiness;

export function coerceToBusinessDate(value: unknown): Date | null {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return null;
    }
    return normalizeBusinessDate(value);
  }

  if (typeof value === "string") {
    return tryParseBusinessDate(value.trim());
  }

  return null;
}

/** Strict Zod parser: only `YYYY-MM-DD` strings or normalized Date objects. */
export const businessDateSchema = z
  .unknown()
  .transform((value, ctx) => {
    const parsed = coerceToBusinessDate(value);
    if (!parsed) {
      ctx.addIssue({
        code: "custom",
        message: INVALID_BUSINESS_DATE_MESSAGE,
      });
      return z.NEVER;
    }
    return parsed;
  });

/** Operational dates (production, feed, etc.) — cannot be in the future (WIB). */
export const operationalBusinessDateSchema = businessDateSchema.refine(
  (date) => !isAfterTodayBusiness(date),
  FUTURE_BUSINESS_DATE_MESSAGE,
);

/** Master-data dates (cycle start/end, PO) — cannot be after today WIB. */
export const businessDateNotFutureSchema = operationalBusinessDateSchema;

export type OperationalBusinessDateResult =
  | { ok: true; date: Date }
  | { ok: false; error: string };

/** Service-layer guard for operational mutations. */
export function validateOperationalBusinessDate(
  date: Date,
  now = new Date(),
): OperationalBusinessDateResult {
  const normalized = normalizeBusinessDate(date);

  if (isAfterTodayBusiness(normalized, now)) {
    return { ok: false, error: FUTURE_BUSINESS_DATE_MESSAGE };
  }

  return { ok: true, date: normalized };
}

export function todayBusinessDateValue(): Date {
  return startOfTodayBusiness();
}
