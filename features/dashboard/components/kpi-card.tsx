"use client";

import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { Area, AreaChart } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart";
import type { DashboardKpi } from "@/features/dashboard/lib/dashboard-executive-types";
import {
  formatDeltaPercent,
  formatKpiValue,
} from "@/features/dashboard/lib/dashboard-format";
import { cn } from "@/lib/utils";

const sparkConfig = {
  value: { label: "Nilai", color: "var(--primary)" },
} satisfies ChartConfig;

type KpiCardProps = {
  kpi: DashboardKpi;
};

function trendIsFavorable(kpi: DashboardKpi): boolean | null {
  if (kpi.direction === "flat") return null;
  if (kpi.invertTrend) return kpi.direction === "down";
  return kpi.direction === "up";
}

export function KpiCard({ kpi }: KpiCardProps) {
  const favorable = trendIsFavorable(kpi);
  const sparkData = kpi.sparkline.map((value, index) => ({
    i: index,
    value,
  }));

  return (
    <Card className="border-border/70 bg-card/80 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-xs font-medium tracking-wide text-muted-foreground uppercase sm:text-[13px] sm:normal-case sm:tracking-normal">
          {kpi.label}
        </CardTitle>
        {kpi.direction === "up" ? (
          <TrendingUp
            className={cn(
              "size-4 shrink-0",
              favorable === false ? "text-destructive" : "text-primary",
            )}
          />
        ) : kpi.direction === "down" ? (
          <TrendingDown
            className={cn(
              "size-4 shrink-0",
              favorable === false ? "text-destructive" : "text-primary",
            )}
          />
        ) : (
          <Minus className="size-4 shrink-0 text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="font-heading text-2xl font-semibold tracking-tight text-foreground tabular-nums sm:text-3xl">
              {formatKpiValue(kpi.value, kpi.format)}
            </p>
            {kpi.unit && kpi.format !== "percent" && kpi.format !== "currency" ? (
              <p className="text-xs text-muted-foreground">{kpi.unit}</p>
            ) : null}
          </div>
          {sparkData.length > 1 ? (
            <ChartContainer
              config={sparkConfig}
              className="h-10 w-24 shrink-0 aspect-auto"
              initialDimension={{ width: 96, height: 40 }}
            >
              <AreaChart data={sparkData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-value)"
                  fill="var(--color-value)"
                  fillOpacity={0.15}
                  strokeWidth={1.5}
                  isAnimationActive={false}
                  dot={false}
                />
              </AreaChart>
            </ChartContainer>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">
          <span
            className={cn(
              "font-medium tabular-nums",
              favorable === true && "text-primary",
              favorable === false && "text-destructive",
            )}
          >
            {formatDeltaPercent(kpi.deltaPercent)}
          </span>{" "}
          {kpi.comparisonLabel}
        </p>
      </CardContent>
    </Card>
  );
}
