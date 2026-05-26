/** Merge URL search param updates; `all` or empty removes the key. */
export function buildListSearchParams(
  base: URLSearchParams,
  updates: Record<string, string | undefined>,
) {
  const next = new URLSearchParams(base.toString());
  for (const [key, value] of Object.entries(updates)) {
    if (!value || value === "all") next.delete(key);
    else next.set(key, value);
  }
  return next;
}

export function listFiltersAreActive(
  searchParams: URLSearchParams,
  filterKeys: string[],
) {
  if (searchParams.get("q")?.trim()) return true;
  return filterKeys.some((key) => {
    const value = searchParams.get(key);
    return Boolean(value && value !== "all");
  });
}
