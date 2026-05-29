export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100] as const;

export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

export const DEFAULT_PAGE_SIZE: PageSize = 10;

export function parsePageSize(value: string | undefined): PageSize {
  const n = Number(value);
  if (PAGE_SIZE_OPTIONS.includes(n as PageSize)) {
    return n as PageSize;
  }
  return DEFAULT_PAGE_SIZE;
}

export function parsePage(value: string | undefined): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};
