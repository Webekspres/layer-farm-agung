import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Egg,
  Package,
  Pill,
  ShoppingCart,
  Skull,
  Sprout,
  Syringe,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ServerSession } from "@/features/auth/lib/session";
import { DashboardCharts } from "@/features/dashboard/components/dashboard-charts";
import { KpiCard } from "@/features/dashboard/components/kpi-card";
import type { DashboardExecutive } from "@/features/dashboard/lib/dashboard-executive-types";
import { formatCount } from "@/features/dashboard/lib/dashboard-format";
import { MORTALITY_WEEK_WARNING_THRESHOLD } from "@/features/dashboard/lib/dashboard-lite-metrics";
import { cn } from "@/lib/utils";

type DashboardOverviewProps = {
  session: ServerSession;
  data: DashboardExecutive | null;
};

const timelineIcon = {
  production: Egg,
  vaccination: Syringe,
  purchase_order: ShoppingCart,
  stock_adjustment: Package,
} as const;

const inventoryIcon = {
  Feed: Sprout,
  Medicine: Pill,
  Vaccine: Syringe,
} as const;

export function DashboardOverview({ session, data }: DashboardOverviewProps) {
  const displayName = session.user.fullName ?? session.user.name ?? "Pengguna";

  if (!data) {
    return (
      <>
        <PageHeader
          title={`Selamat datang, ${displayName}`}
          description="Pilih tenant aktif untuk melihat kesehatan operasional farm."
        />
        <Card className="border-border/70 shadow-sm">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Belum ada tenant aktif. Gunakan pemilih tenant di header untuk
            membuka ringkasan eksekutif.
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          title={`Selamat datang, ${displayName}`}
          description="Ringkasan kesehatan operasional farm — produksi, stok, dan keuangan hari ini."
        />
      </div>

      <section className="space-y-3">
        <h2 className="sr-only">Ringkasan KPI</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {data.kpis.map((kpi) => (
            <KpiCard key={kpi.id} kpi={kpi} />
          ))}
        </div>
      </section>

      {(data.earlyWarnings.length > 0 || data.mortalityWarnings.length > 0) && (
        <section className="grid gap-4 lg:grid-cols-2">
          {data.earlyWarnings.length > 0 ? (
            <AlertCard
              icon={AlertTriangle}
              title="Peringatan dini HDP"
              description="Kandang di bawah 90% target HDP strain hari ini."
            >
              {data.earlyWarnings.map((warning) => (
                <Link
                  key={warning.cageId}
                  href={`/dashboard/cages/${warning.cageId}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/80 px-3 py-2 text-sm transition-colors hover:bg-muted/40"
                >
                  <span className="font-medium">{warning.cageName}</span>
                  <Badge variant="destructive">
                    {warning.actualHdp.toFixed(1)}% /{" "}
                    {warning.targetHdp.toFixed(1)}%
                  </Badge>
                </Link>
              ))}
            </AlertCard>
          ) : null}
          {data.mortalityWarnings.length > 0 ? (
            <AlertCard
              icon={Skull}
              title="Peringatan mortalitas"
              description={`Kematian ≥ ${MORTALITY_WEEK_WARNING_THRESHOLD} ekor dalam 7 hari.`}
            >
              {data.mortalityWarnings.map((warning) => (
                <Link
                  key={warning.cageId}
                  href={`/dashboard/cages/${warning.cageId}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/80 px-3 py-2 text-sm transition-colors hover:bg-muted/40"
                >
                  <span className="font-medium">{warning.cageName}</span>
                  <Badge variant="destructive">
                    {formatCount(warning.deaths)} ekor
                  </Badge>
                </Link>
              ))}
            </AlertCard>
          ) : null}
        </section>
      )}

      <DashboardCharts data={data} />

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border/70 bg-card/80 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-base">
              Inventori saprodi
            </CardTitle>
            <CardDescription>
              Agregat stok pakan, obat, dan vaksin di semua lokasi.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {data.inventory.map((bucket) => {
                const Icon = inventoryIcon[bucket.type];
                return (
                  <div
                    key={bucket.type}
                    className="rounded-xl border border-border/70 bg-muted/20 p-3"
                  >
                    <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                      <Icon className="size-4 text-primary" />
                      <span className="text-xs font-medium tracking-wide uppercase">
                        {bucket.label}
                      </span>
                    </div>
                    <p className="font-heading text-xl font-semibold tabular-nums">
                      {formatCount(bucket.quantity)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {bucket.unit} · {formatCount(bucket.itemCount)} item
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">Peringatan stok rendah</p>
                <Link
                  href="/dashboard/inventory"
                  className="text-xs font-medium text-primary underline-offset-2 hover:underline"
                >
                  Lihat inventori
                </Link>
              </div>
              {data.lowStockAlerts.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border/80 px-3 py-4 text-sm text-muted-foreground">
                  Tidak ada item di bawah ambang minimum.
                </p>
              ) : (
                <ul className="space-y-2">
                  {data.lowStockAlerts.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/dashboard/inventory/${item.id}`}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border/80 px-3 py-2 text-sm transition-colors hover:bg-muted/40"
                      >
                        <span className="truncate font-medium">{item.name}</span>
                        <Badge variant="destructive" className="shrink-0">
                          {formatCount(item.totalQuantity)} {item.unit} / min{" "}
                          {formatCount(item.minStockAlert)}
                        </Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/80 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 font-heading text-base">
              <Activity className="size-4 text-primary" />
              Timeline operasional
            </CardTitle>
            <CardDescription>
              Aktivitas terbaru: produksi, vaksinasi, PO, dan mutasi stok.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.timeline.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border/80 px-3 py-8 text-center text-sm text-muted-foreground">
                Belum ada aktivitas operasional terbaru.
              </p>
            ) : (
              <ol className="relative space-y-0 border-l border-border/80 pl-4">
                {data.timeline.map((item, index) => {
                  const Icon = timelineIcon[item.kind];
                  const content = (
                    <div
                      className={cn(
                        "relative pb-5 last:pb-0",
                        index === data.timeline.length - 1 && "pb-0",
                      )}
                    >
                      <span className="absolute left-[-1.4rem] flex size-6 items-center justify-center rounded-full border border-border bg-card text-primary">
                        <Icon className="size-3" />
                      </span>
                      <p className="text-sm font-medium text-foreground">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.description}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground/80 tabular-nums">
                        {formatTimelineAt(item.at)}
                      </p>
                    </div>
                  );

                  return (
                    <li key={item.id}>
                      {item.href ? (
                        <Link
                          href={item.href}
                          className="block rounded-md transition-colors hover:bg-muted/30"
                        >
                          {content}
                        </Link>
                      ) : (
                        content
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function AlertCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof AlertTriangle;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-destructive/35 bg-card/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 font-heading text-base">
          <Icon className="size-4 text-destructive" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">{children}</CardContent>
    </Card>
  );
}

function formatTimelineAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
