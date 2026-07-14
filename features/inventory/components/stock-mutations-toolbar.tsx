"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { buildListSearchParams } from "@/features/master-data/lib/url-list-params";
import { MUTATION_TYPE_LABELS } from "@/features/inventory/lib/mutation-type-labels";
import { StockMutationType } from "@/features/inventory/lib/stock-mutation-types";

const MUTATION_TYPE_VALUES = Object.values(StockMutationType);

type StockMutationsToolbarProps = {
  locations: { id: string; name: string }[];
};

export function StockMutationsToolbar({
  locations,
}: StockMutationsToolbarProps) {
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

  const type = searchParams.get("type") ?? "all";
  const location = searchParams.get("location") ?? "all";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";

  function updateFilter(key: string, value: string | undefined) {
    const next = buildListSearchParams(searchParams, { [key]: value });
    startTransition(() => {
      router.replace(`${pathname}?${next.toString()}`);
    });
  }

  return (
    <div className="grid min-w-0 gap-2 sm:grid-cols-2 lg:flex lg:flex-row lg:flex-wrap lg:items-center">
      <div className="relative min-w-0 sm:col-span-2 lg:max-w-xs lg:flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari nama item..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>
      <Select value={type} onValueChange={(v) => updateFilter("type", v)}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Jenis mutasi" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua jenis</SelectItem>
          {MUTATION_TYPE_VALUES.map((t) => (
            <SelectItem key={t} value={t}>
              {MUTATION_TYPE_LABELS[t]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {locations.length > 0 ? (
        <Select
          value={location}
          onValueChange={(v) => updateFilter("location", v)}
        >
          <SelectTrigger className="w-full sm:w-45">
            <SelectValue placeholder="Lokasi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua lokasi</SelectItem>
            {locations.map((loc) => (
              <SelectItem key={loc.id} value={loc.id}>
                {loc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
      <Input
        type="date"
        value={from}
        onChange={(e) => updateFilter("from", e.target.value || undefined)}
        className="w-full sm:w-38"
        aria-label="Dari tanggal"
      />
      <Input
        type="date"
        value={to}
        onChange={(e) => updateFilter("to", e.target.value || undefined)}
        className="w-full sm:w-38"
        aria-label="Sampai tanggal"
      />
    </div>
  );
}
