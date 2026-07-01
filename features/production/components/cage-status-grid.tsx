"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DailyInputRecapTabId } from "@/features/production/config/daily-input-recap-tabs";
import type { AdminCageStatusItem } from "@/features/production/services/list-admin-cages-status";

type CageStatusGridProps = {
  cages: AdminCageStatusItem[];
  activeTab: DailyInputRecapTabId;
  selectedCageId?: string;
};

const tabStatusKey = {
  eggs: "hasEggs",
  feed: "hasFeed",
  population: "hasPopulation",
  medical: "hasMedical",
} as const;

export function CageStatusGrid({
  cages,
  activeTab,
  selectedCageId,
}: CageStatusGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  function selectCage(cage: AdminCageStatusItem) {
    const next = new URLSearchParams(searchParams.toString());
    const isSelected = selectedCageId === cage.id;

    if (isSelected) {
      next.delete("cageId");
      next.delete("cageName");
    } else {
      next.set("cageId", cage.id);
      next.set("cageName", cage.name);
    }

    const query = next.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname);
    });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cages.map((cage) => {
        const selected = cage.id === selectedCageId;
        const statusKey = tabStatusKey[activeTab];
        const hasCurrentData = cage[statusKey];

        return (
          <button
            key={cage.id}
            type="button"
            onClick={() => selectCage(cage)}
            className={cn(
              "group flex min-h-[170px] w-full flex-col justify-between rounded-3xl border bg-card p-4 text-left transition",
              selected
                ? "border-primary ring-2 ring-primary/20"
                : "border-border hover:border-primary/70 hover:bg-muted",
            )}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 text-left">
                  <p className="text-sm font-semibold text-foreground">{cage.name}</p>
                  <p className="text-xs text-muted-foreground">{cage.locationName}</p>
                </div>
                <Badge
                  variant={hasCurrentData ? "default" : "destructive"}
                  className="rounded-full px-3 py-1"
                >
                  {hasCurrentData ? "Lapor" : "Belum"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{cage.strainName}</p>
            </div>

            <div className="mt-4 grid gap-2 text-xs">
              <span
                className={cn(
                  "inline-flex items-center gap-2",
                  cage.hasEggs ? "text-emerald-400" : "text-muted-foreground",
                )}
              >
                🥚 Telur
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-2",
                  cage.hasFeed ? "text-emerald-400" : "text-muted-foreground",
                )}
              >
                🌽 Pakan
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-2",
                  cage.hasPopulation ? "text-emerald-400" : "text-muted-foreground",
                )}
              >
                🐔 Populasi
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-2",
                  cage.hasMedical ? "text-emerald-400" : "text-muted-foreground",
                )}
              >
                💊 Obat
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
