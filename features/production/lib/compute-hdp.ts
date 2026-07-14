/**
 * Hen Day Production (HDP) % = (TB / populasi layer aktif) × 100
 */
export function computeHdpPercent(
  tb: number,
  population: number,
): number | null {
  if (population <= 0 || tb < 0) {
    return null;
  }

  return (tb / population) * 100;
}

export function formatHdpPercent(value: number | null): string {
  if (value === null) {
    return "—";
  }

  return `${value.toFixed(1)}%`;
}
