"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SubdomainsToolbarProps = {
  onCreateClick: () => void;
};

function buildQuery(
  base: URLSearchParams,
  updates: Record<string, string | undefined>,
) {
  const next = new URLSearchParams(base.toString());
  for (const [key, value] of Object.entries(updates)) {
    if (!value || value === "all") {
      next.delete(key);
    } else {
      next.set(key, value);
    }
  }
  return next;
}

export function SubdomainsToolbar({ onCreateClick }: SubdomainsToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const qParam = searchParams.get("q") ?? "";
  const [search, setSearch] = useState(qParam);

  useEffect(() => {
    setSearch(qParam);
  }, [qParam]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (search === qParam) return;
      const next = buildQuery(searchParams, {
        q: search || undefined,
      });
      startTransition(() => {
        router.replace(`${pathname}?${next.toString()}`);
      });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [search, qParam, pathname, router, searchParams]);

  function updateFilter(key: string, value: string) {
    const next = buildQuery(searchParams, { [key]: value });
    startTransition(() => {
      router.replace(`${pathname}?${next.toString()}`);
    });
  }

  const status = searchParams.get("status") ?? "all";

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
      <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2 lg:flex lg:flex-row lg:flex-wrap lg:items-center">
        <div className="relative min-w-0 sm:col-span-2 lg:max-w-xs lg:flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau URL cabang..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        <Select value={status} onValueChange={(v) => updateFilter("status", v)}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua status</SelectItem>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="inactive">Nonaktif</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={onCreateClick}
        className="w-full shrink-0 cursor-pointer sm:w-auto lg:self-center hover:bg-primary/90"
      >
        <Plus className="size-4" />
        Tambah cabang
      </Button>
    </div>
  );
}
