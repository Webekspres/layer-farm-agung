"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { buildListSearchParams } from "@/features/master-data/lib/url-list-params";
import { cn } from "@/lib/utils";

type InventoryView = "saprodi" | "eggs";

const TABS: { key: InventoryView; label: string }[] = [
  { key: "saprodi", label: "Pakan & Saprodi" },
  { key: "eggs", label: "Stok Telur" },
];

export function InventoryTabs({ active }: { active: InventoryView }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div className="flex w-fit gap-1 rounded-lg border border-border bg-muted/40 p-1">
      {TABS.map((tab) => {
        const href = `${pathname}?${buildListSearchParams(searchParams, {
          view: tab.key,
          page: undefined,
        }).toString()}`;
        return (
          <Link
            key={tab.key}
            href={href}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              active === tab.key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}