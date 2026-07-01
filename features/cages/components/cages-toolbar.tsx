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

type CagesToolbarProps = {
  locations: { id: string; name: string }[];
  strains: { id: number; name: string }[];
  onCreateClick: () => void;
};

export function CagesToolbar({
  locations,
  strains,
  onCreateClick,
}: CagesToolbarProps) {
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

  const locationFilter = searchParams.get("location") ?? "all";
  const strainFilter = searchParams.get("strain") ?? "all";
  const cycleStatusFilter = searchParams.get("cycleStatus") ?? "all"; // 👈 ➕ State filter siklus baru
  const statusFilter = searchParams.get("status") ?? "Active";

  function updateFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());

    if (key === "status") {
      // Default dashboard bawaan adalah "Active" (Gunakan)
      if (value === "Active") {
        next.delete("status");
      } else {
        next.set("status", value);
      }
    } else {
      if (!value || value === "all") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    }

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
            placeholder="Cari kandang, lokasi, strain..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Filter Lokasi */}
        <Select
          value={locationFilter}
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

        {/* Filter Strain */}
        <Select
          value={strainFilter}
          onValueChange={(v) => updateFilter("strain", v)}
        >
          <SelectTrigger className="w-full sm:w-45">
            <SelectValue placeholder="Strain" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua strain</SelectItem>
            {strains.map((strain) => (
              <SelectItem key={strain.id} value={String(strain.id)}>
                {strain.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 🟢 ➕ FILTER BARU: Kondisi Siklus Ayam */}
        <Select
          value={cycleStatusFilter}
          onValueChange={(v) => updateFilter("cycleStatus", v)}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Semua Siklus" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Siklus</SelectItem>
            <SelectItem value="Active">Siklus Aktif</SelectItem>
            <SelectItem value="Inactive">Siklus Tidak Aktif</SelectItem>
          </SelectContent>
        </Select>

        {/* 🔒 FILTER DIPERBAIKI: Status Arsip Data Master */}
        <Select
          value={statusFilter}
          onValueChange={(v) => updateFilter("status", v)}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="Active">Aktif</SelectItem>
            <SelectItem value="Archived">Diarsipkan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={onCreateClick}
        className="w-full shrink-0 sm:w-auto lg:self-center"
      >
        <Plus className="size-4" />
        Tambah kandang
      </Button>
    </div>
  );
}
