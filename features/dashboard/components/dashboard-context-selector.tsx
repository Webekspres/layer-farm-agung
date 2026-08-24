"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STAFF_ROLE_NAME } from "@/features/roles/config/system-roles";
import type { DashboardCageOption } from "@/features/dashboard/lib/resolve-dashboard-cage-scope";

type DashboardContextSelectorProps = {
  cages: DashboardCageOption[];
  selectedCageId: string | null;
  roleName: string;
  scopeError?: string | null;
};

export function DashboardContextSelector({
  cages,
  selectedCageId,
  roleName,
  scopeError,
}: DashboardContextSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isStaff = roleName === STAFF_ROLE_NAME;
  const allLabel = isStaff ? "Semua kandang saya" : "Semua Kandang";
  const value = selectedCageId ?? "all";

  function onValueChange(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") {
      params.delete("cageId");
    } else {
      params.set("cageId", next);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">
        Konteks dasbor
      </label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full bg-background">
          <SelectValue placeholder={allLabel} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{allLabel}</SelectItem>
          {cages.map((cage) => (
            <SelectItem key={cage.id} value={cage.id}>
              {cage.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {scopeError ? (
        <p className="text-xs text-destructive">{scopeError}</p>
      ) : null}
    </div>
  );
}
