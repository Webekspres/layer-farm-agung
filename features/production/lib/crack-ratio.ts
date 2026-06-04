/** True when pecah melebihi ambang % dari total panen (layak + pecah). */
export function crackRatioExceedsThreshold(
  quantity: number,
  eggCrack: number,
  threshold = 0.05,
): boolean {
  const total = quantity + eggCrack;
  if (total <= 0) return false;
  return eggCrack / total > threshold;
}
