/**
 * True when Telur Retak (TR) melebihi ambang % dari total panen.
 * TP (Telur Putih) bukan cacat — hanya TR yang dihitung (laporan revisi 1 §1).
 */
export function crackRatioExceedsThreshold(
  tb: number,
  tr: number,
  tp: number,
  threshold = 0.05,
): boolean {
  const total = tb + tr + tp;
  if (total <= 0) return false;
  return tr / total > threshold;
}
