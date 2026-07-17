"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { DashboardExecutive } from "@/features/dashboard/lib/dashboard-executive-types";
import { formatCurrency, formatCount } from "@/features/dashboard/lib/dashboard-format";
import { seriesHasSignal } from "@/features/dashboard/lib/dashboard-series";

const productionConfig = {
  eggs: { label: "Telur (TB)", color: "var(--chart-1)" },
} satisfies ChartConfig;

const hdpConfig = {
  hdp: { label: "HDP aktual", color: "var(--primary)" },
  target: { label: "Target HDP", color: "var(--chart-4)" },
} satisfies ChartConfig;

const feedConfig = {
  kg: { label: "Pakan (kg)", color: "var(--chart-2)" },
} satisfies ChartConfig;

const mortalityConfig = {
  deaths: { label: "Kematian (ekor)", color: "var(--chart-5)" },
} satisfies ChartConfig;

const salesConfig = {
  amount: { label: "Penjualan", color: "var(--chart-1)" },
} satisfies ChartConfig;

const cashConfig = {
  income: { label: "Pemasukan", color: "var(--primary)" },
  expense: { label: "Pengeluaran", color: "var(--chart-4)" },
} satisfies ChartConfig;

const gradeConfig = {
  value: { label: "Butir" },
} satisfies ChartConfig;

type DashboardChartsProps = {
  data: DashboardExecutive;
};

export function DashboardCharts({ data }: DashboardChartsProps) {
  const hasProduction = seriesHasSignal(
    data.production30d.map((p) => ({ value: p.eggs })),
  );
  const hasHdp =
    hasProduction && data.hdpVsTarget30d.some((p) => p.hdp > 0 || p.target > 0);
  const hasGrades = data.eggGradeDistribution.length > 0;
  const hasFeed = data.feedPerCage.length > 0;
  const hasMortality = seriesHasSignal(
    data.mortalityTrend.map((p) => ({ value: p.deaths })),
  );
  const hasSales = seriesHasSignal(
    data.sales7d.map((p) => ({ value: p.amount })),
  );
  const hasCashflow = data.cashflow7d.some(
    (p) => p.income > 0 || p.expense > 0,
  );

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <SectionHeading
          title="Analitik produksi"
          description="Tren 30 hari — volume telur dan HDP dibanding target strain."
        />
        <div className="grid gap-4 xl:grid-cols-2">
          <ChartPanel
            title="Produksi telur 30 hari"
            description="Total butir bagus (TB) per hari operasional."
          >
            {hasProduction ? (
              <ChartContainer
                config={productionConfig}
                className="aspect-video h-[240px] w-full sm:h-[280px]"
              >
                <LineChart
                  data={data.production30d}
                  margin={{ left: 4, right: 8, top: 8, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    minTickGap={28}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={48}
                    tickFormatter={(v) => formatCompact(Number(v))}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => formatCount(Number(value))}
                      />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="eggs"
                    stroke="var(--color-eggs)"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ChartContainer>
            ) : (
              <ChartEmpty message="Belum ada catatan produksi 30 hari terakhir." />
            )}
          </ChartPanel>

          <ChartPanel
            title="HDP vs target"
            description="Hen Day Production aktual dibanding rata-rata target strain."
          >
            {hasHdp ? (
              <ChartContainer
                config={hdpConfig}
                className="aspect-video h-[240px] w-full sm:h-[280px]"
              >
                <LineChart
                  data={data.hdpVsTarget30d}
                  margin={{ left: 4, right: 8, top: 8, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    minTickGap={28}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={40}
                    domain={["auto", "auto"]}
                    tickFormatter={(v) => `${Number(v).toFixed(0)}%`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    type="monotone"
                    dataKey="hdp"
                    stroke="var(--color-hdp)"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="var(--color-target)"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ChartContainer>
            ) : (
              <ChartEmpty message="Belum ada data HDP (produksi + populasi aktif)." />
            )}
          </ChartPanel>
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeading
          title="Performa farm"
          description="Distribusi grade penjualan, konsumsi pakan, dan tren mortalitas."
        />
        <div className="grid gap-4 lg:grid-cols-3">
          <ChartPanel
            title="Distribusi grade telur"
            description="Proporsi quantity penjualan 30 hari (label grade)."
            className="lg:col-span-1"
          >
            {hasGrades ? (
              <>
                <ChartContainer
                  config={gradeConfig}
                  className="mx-auto aspect-square h-[220px] w-full max-w-[260px]"
                >
                  <PieChart>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          nameKey="grade"
                          formatter={(value) => formatCount(Number(value))}
                        />
                      }
                    />
                    <Pie
                      data={data.eggGradeDistribution}
                      dataKey="value"
                      nameKey="grade"
                      innerRadius={52}
                      outerRadius={78}
                      strokeWidth={2}
                      isAnimationActive={false}
                    >
                      {data.eggGradeDistribution.map((slice) => (
                        <Cell key={slice.grade} fill={slice.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <ul className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  {data.eggGradeDistribution.map((slice) => (
                    <li key={slice.grade} className="flex items-center gap-1.5">
                      <span
                        className="size-2 rounded-sm"
                        style={{ backgroundColor: slice.fill }}
                      />
                      {slice.grade}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <ChartEmpty message="Belum ada penjualan dengan label grade." />
            )}
          </ChartPanel>

          <ChartPanel
            title="Konsumsi pakan per kandang"
            description="Total kg 7 hari terakhir."
            className="lg:col-span-1"
          >
            {hasFeed ? (
              <ChartContainer
                config={feedConfig}
                className="aspect-4/3 h-[240px] w-full"
              >
                <BarChart
                  data={data.feedPerCage}
                  margin={{ left: 4, right: 8, top: 8, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="cage"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={40}
                    tickFormatter={(v) => formatCompact(Number(v))}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) =>
                          `${formatCount(Number(value))} kg`
                        }
                      />
                    }
                  />
                  <Bar
                    dataKey="kg"
                    fill="var(--color-kg)"
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <ChartEmpty message="Belum ada konsumsi pakan 7 hari terakhir." />
            )}
          </ChartPanel>

          <ChartPanel
            title="Tren mortalitas"
            description="Kematian (Mati) harian — 30 hari."
            className="lg:col-span-1"
          >
            {hasMortality ? (
              <ChartContainer
                config={mortalityConfig}
                className="aspect-4/3 h-[240px] w-full"
              >
                <AreaChart
                  data={data.mortalityTrend}
                  margin={{ left: 4, right: 8, top: 8, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    minTickGap={24}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={32}
                    allowDecimals={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="deaths"
                    stroke="var(--color-deaths)"
                    fill="var(--color-deaths)"
                    fillOpacity={0.2}
                    strokeWidth={2}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <ChartEmpty message="Belum ada catatan kematian 30 hari terakhir." />
            )}
          </ChartPanel>
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeading
          title="Ringkasan keuangan"
          description="Penjualan dan arus kas 7 hari operasional."
        />
        <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr_0.8fr]">
          <ChartPanel
            title="Penjualan 7 hari"
            description="Total penjualan telur per hari."
          >
            {hasSales ? (
              <ChartContainer
                config={salesConfig}
                className="aspect-video h-[220px] w-full sm:h-[240px]"
              >
                <BarChart
                  data={data.sales7d}
                  margin={{ left: 4, right: 8, top: 8, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={52}
                    tickFormatter={(v) => formatCompact(Number(v))}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                    }
                  />
                  <Bar
                    dataKey="amount"
                    fill="var(--color-amount)"
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <ChartEmpty message="Belum ada penjualan 7 hari terakhir." />
            )}
          </ChartPanel>

          <ChartPanel
            title="Cashflow"
            description="Pemasukan vs pengeluaran kas."
          >
            {hasCashflow ? (
              <ChartContainer
                config={cashConfig}
                className="aspect-video h-[220px] w-full sm:h-[240px]"
              >
                <BarChart
                  data={data.cashflow7d}
                  margin={{ left: 4, right: 8, top: 8, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={52}
                    tickFormatter={(v) => formatCompact(Number(v))}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                    }
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey="income"
                    fill="var(--color-income)"
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={false}
                  />
                  <Bar
                    dataKey="expense"
                    fill="var(--color-expense)"
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <ChartEmpty message="Belum ada transaksi kas 7 hari terakhir." />
            )}
          </ChartPanel>

          <Card className="border-border/70 bg-card/80 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="font-heading text-base">
                Laba minggu
              </CardTitle>
              <CardDescription>
                Saldo kas 7 hari (pemasukan − pengeluaran).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p
                className={`font-heading text-3xl font-semibold tracking-tight tabular-nums ${
                  data.weeklyProfit >= 0 ? "text-primary" : "text-destructive"
                }`}
              >
                {formatCurrency(data.weeklyProfit)}
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-2 border-b border-border/60 pb-2">
                  <span className="text-muted-foreground">Penjualan 7 hari</span>
                  <span className="font-medium tabular-nums">
                    {formatCurrency(data.weekSalesTotal)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-1">
      <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function ChartPanel({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={`border-border/70 bg-card/80 shadow-sm ${className ?? ""}`}>
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function ChartEmpty({ message }: { message: string }) {
  return (
    <div className="flex h-[220px] items-center justify-center rounded-lg border border-dashed border-border/80 px-4 text-center text-sm text-muted-foreground sm:h-[240px]">
      {message}
    </div>
  );
}

function formatCompact(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}
