import { normalizeBusinessDate } from "@/lib/business-date";

/** Whole weeks elapsed since cycle start (floor). */
export function cycleAgeInWeeks(startDate: Date, asOfDate: Date = new Date()): number {
  const start = normalizeBusinessDate(startDate);
  const asOf = normalizeBusinessDate(asOfDate);
  const diffMs = Math.max(0, asOf.getTime() - start.getTime());
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7);
}
