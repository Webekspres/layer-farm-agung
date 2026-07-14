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
import { buildListSearchParams } from "@/features/master-data/lib/url-list-params";
import { vendorCategories } from "@/features/vendors/schemas/vendor";

type VendorsToolbarProps = {
  onCreateClick: () => void;
};

export function VendorsToolbar({ onCreateClick }: VendorsToolbarProps) {
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
      const next = buildListSearchParams(searchParams, {
        q: search || undefined,
      });
      startTransition(() => {
        router.replace(`${pathname}?${next.toString()}`);
      });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [search, qParam, pathname, router, searchParams]);

  const category = searchParams.get("category") ?? "all";

  function updateFilter(key: string, value: string) {
    const next = buildListSearchParams(searchParams, { [key]: value });
    startTransition(() => {
      router.replace(`${pathname}?${next.toString()}`);
    });
  }

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
      <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2 lg:flex lg:flex-row lg:flex-wrap lg:items-center">
        <div className="relative min-w-0 sm:col-span-2 lg:max-w-xs lg:flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari nama, kategori, atau alamat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          value={category}
          onValueChange={(v) => updateFilter("category", v)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua kategori</SelectItem>
            {vendorCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={onCreateClick} className="w-full shrink-0 sm:w-auto lg:self-center">
        <Plus className="size-4" />
        Tambah vendor
      </Button>
    </div>
  );
}
