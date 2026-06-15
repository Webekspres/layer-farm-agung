/** True when TR+TP melebihi ambang % dari total panen (TB+TR+TP). */
export function crackRatioExceedsThreshold(
  tb: number,
  tr: number,
  tp: number,
  threshold = 0.05,
): boolean {
  const total = tb + tr + tp;
  if (total <= 0) return false;
  return (tr + tp) / total > threshold;
}
