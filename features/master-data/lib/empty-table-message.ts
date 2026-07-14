export function masterDataEmptyMessage(
  hasActiveFilter: boolean,
  emptyLabel: string,
  filteredLabel = "Tidak ada data yang cocok dengan pencarian atau filter saat ini.",
) {
  return hasActiveFilter ? filteredLabel : emptyLabel;
}
