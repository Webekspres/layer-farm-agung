"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import {
  FINANCE_TABS,
  type FinanceTabId,
} from "@/features/finance/config/finance-tabs";

type FinanceTabsProps = {
  activeTab: FinanceTabId;
};

export function FinanceTabs({ activeTab }: FinanceTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  function selectTab(tab: FinanceTabId) {
    const next = new URLSearchParams();

    if (tab !== "cashflow") {
      next.set("tab", tab);
    }

    const query = next.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname);
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {FINANCE_TABS.map((tab) => {
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
