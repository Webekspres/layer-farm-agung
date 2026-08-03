export function formatCount(value: number) {
  return value.toLocaleString("id-ID");
}

export function formatPercent(value: number) {
  return `${value.toLocaleString("id-ID", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

export function formatFcr(value: number) {
  return value.toLocaleString("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  });
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatKpiValue(
  value: number | null,
  format: "count" | "percent" | "fcr" | "currency" | "integer",
): string {
  if (value == null) return "—";
  switch (format) {
    case "percent":
      return formatPercent(value);
    case "fcr":
      return formatFcr(value);
    case "currency":
      return formatCurrency(value);
    case "count":
    case "integer":
    default:
      return formatCount(value);
  }
}

export function formatDeltaPercent(value: number | null): string {
  if (value == null) return "—";
  const abs = Math.abs(value).toLocaleString("id-ID", {
    maximumFractionDigits: 1,
  });
  if (value > 0) return `+${abs}%`;
  if (value < 0) return `−${abs}%`;
  return "0%";
}
