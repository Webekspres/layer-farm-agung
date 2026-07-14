"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";
import {
  DAILY_INPUT_RECAP_TABS,
  type DailyInputRecapTabId,
} from "@/features/production/config/daily-input-recap-tabs";

type DailyInputRecapTabsProps = {
  activeTab: DailyInputRecapTabId;
};

export function DailyInputRecapTabs({ activeTab }: DailyInputRecapTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  function selectTab(tab: DailyInputRecapTabId) {
    const next = new URLSearchParams(searchParams.toString());

    if (tab === "eggs") {
      next.delete("tab");
    } else {
      next.set("tab", tab);
    }

    const query = next.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname);
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {DAILY_INPUT_RECAP_TABS.map((tab) => {
        const selected = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => selectTab(tab.id)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:bg-muted",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
