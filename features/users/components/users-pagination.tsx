"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  USER_PAGE_SIZE_OPTIONS,
  type UserPageSize,
} from "@/features/users/lib/pagination";
import type { UsersPaginationMeta } from "@/features/users/types";

type UsersPaginationProps = UsersPaginationMeta;

function buildQuery(
  base: URLSearchParams,
  updates: Record<string, string | undefined>,
  resetPage = false,
) {
  const next = new URLSearchParams(base.toString());
  if (resetPage) {
    next.delete("page");
  }
  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
  }
  return next;
}

export function UsersPagination({
  page,
  pageSize,
  total,
  totalPages,
}: UsersPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  function navigate(updates: Record<string, string | undefined>, resetPage = false) {
    const next = buildQuery(searchParams, updates, resetPage);
    startTransition(() => {
      router.replace(`${pathname}?${next.toString()}`);
    });
  }

  function goToPage(nextPage: number) {
    if (nextPage < 1 || nextPage > totalPages) return;
    navigate({ page: nextPage === 1 ? undefined : String(nextPage) });
  }

  function changePageSize(size: UserPageSize) {
    navigate(
      {
        pageSize: size === 10 ? undefined : String(size),
        page: undefined,
      },
      true,
    );
  }

  return (
    <div className="flex flex-col gap-3 border-t border-border bg-card px-4 py-3 text-card-foreground sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        {total === 0
          ? "Tidak ada data"
          : `Menampilkan ${from}–${to} dari ${total} pengguna`}
      </p>

      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            Baris per halaman
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => changePageSize(Number(v) as UserPageSize)}
            disabled={isPending}
          >
            <SelectTrigger className="h-8 w-[72px]" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {USER_PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={page <= 1 || isPending}
            onClick={() => goToPage(page - 1)}
            aria-label="Halaman sebelumnya"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-18 px-2 text-center text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={page >= totalPages || isPending || total === 0}
            onClick={() => goToPage(page + 1)}
            aria-label="Halaman berikutnya"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
