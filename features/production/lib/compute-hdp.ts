/**
 * Hen Day Production (HDP) % = (Total seluruh telur tercatat / populasi layer aktif) × 100
 *
 * Pembilang memakai TOTAL semua kategori grade yang tercatat pada tanggal
 * tersebut (laporan penyelarasan revisi 1 §4) — bukan hanya TB.
 */
export function computeHdpPercent(
  eggs: number,
  population: number,
): number | null {
  if (population <= 0 || eggs < 0) {
    return null;
  }

  return (eggs / population) * 100;
}

export function formatHdpPercent(value: number | null): string {
  if (value === null) {
    return "—";
  }

  return `${value.toFixed(1)}%`;
}
