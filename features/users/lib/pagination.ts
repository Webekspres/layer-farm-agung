export const USER_PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100] as const;

export type UserPageSize = (typeof USER_PAGE_SIZE_OPTIONS)[number];

export const DEFAULT_USER_PAGE_SIZE: UserPageSize = 10;

export function parseUserPageSize(value: string | undefined): UserPageSize {
  const n = Number(value);
  if (USER_PAGE_SIZE_OPTIONS.includes(n as UserPageSize)) {
    return n as UserPageSize;
  }
  return DEFAULT_USER_PAGE_SIZE;
}

export function parseUserPage(value: string | undefined): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}
