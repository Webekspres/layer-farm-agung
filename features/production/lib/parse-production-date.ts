const DATE_PARAM_RE = /^\d{4}-\d{2}-\d{2}$/;

export function startOfUtcDate(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export function startOfTodayUtc() {
  return startOfUtcDate(new Date());
}

/** `YYYY-MM-DD` for URL search param. */
export function formatProductionDateParam(date: Date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatProductionDateLabel(date: Date) {
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function parseProductionRecordDate(
  param: string | null | undefined,
  now = new Date(),
): Date {
  if (!param || !DATE_PARAM_RE.test(param)) {
    return startOfUtcDate(now);
  }

  const [year, month, day] = param.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return startOfUtcDate(now);
  }

  return parsed;
}

export function shiftProductionDate(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return startOfUtcDate(next);
}

export function isProductionToday(date: Date, now = new Date()) {
  return (
    formatProductionDateParam(date) === formatProductionDateParam(startOfUtcDate(now))
  );
}
