/**
 * Operational calendar for AAPM — always WIB (Asia/Jakarta).
 * Record dates in DB are calendar days encoded as UTC midnight (`2026-07-09` → `2026-07-09T00:00:00.000Z`).
 */
export const BUSINESS_TIMEZONE = "Asia/Jakarta" as const;

export type BusinessCalendarParts = {
  year: number;
  month: number;
  day: number;
};

const businessDatePartsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: BUSINESS_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Calendar year/month/day for an instant in WIB. */
export function getBusinessCalendarParts(instant: Date): BusinessCalendarParts {
  const parts = businessDatePartsFormatter.formatToParts(instant);
  return {
    year: Number(parts.find((part) => part.type === "year")?.value),
    month: Number(parts.find((part) => part.type === "month")?.value),
    day: Number(parts.find((part) => part.type === "day")?.value),
  };
}

/** WIB calendar day → stored record date (UTC midnight with same Y-M-D). */
export function businessDateFromParts(parts: BusinessCalendarParts): Date {
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
}

/** Map any instant to its WIB calendar day as a stored record date. */
export function businessDateFromInstant(instant: Date): Date {
  return businessDateFromParts(getBusinessCalendarParts(instant));
}

export function formatInstantInBusinessTimezone(
  instant: Date,
  options: Intl.DateTimeFormatOptions,
): string {
  return instant.toLocaleDateString("id-ID", {
    ...options,
    timeZone: BUSINESS_TIMEZONE,
  });
}
