import Link from "next/link";
import { AlertTriangle, Egg, Package, TrendingUp, Users } from "lucide-react";
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
import type { DashboardStats } from "@/features/dashboard/services/get-dashboard-stats";

type DashboardOverviewProps = {
  session: ServerSession;
  stats: DashboardStats | null;
};

function formatCount(value: number) {
  return value.toLocaleString("id-ID");
}

export function DashboardOverview({ session, stats }: DashboardOverviewProps) {
  const displayName = session.user.fullName ?? session.user.name ?? "Pengguna";
  const activeTenant =
    session.session.activeTenantId ?? session.user.tenantId;

  const statCards = [
    {
      title: "Produksi hari ini",
      value: stats ? formatCount(stats.todayEggTotal) : "—",
      description: "Butir telur bagus (TB) tercatat",
      icon: Egg,
    },
    {
      title: "Populasi aktif",
      value: stats ? formatCount(stats.activePopulationTotal) : "—",
      description: "Ekor di kandang ber-siklus aktif",
      icon: TrendingUp,
    },
    {
      title: "Stok kritis",
      value: stats ? formatCount(stats.lowStockItemCount) : "—",
      description: "Item di bawah ambang batas",
      icon: Package,
    },
    {
      title: "Pengguna aktif",
      value: stats ? formatCount(stats.activeUserCount) : "—",
      description: "Akun tenant aktif",
      icon: Users,
    },
  ] as const;

  return (
    <>
      <PageHeader
        title={`Selamat datang, ${displayName}`}
        description="Ringkasan operasional peternakan ayam petelur Anda."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-border/80 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <stat.icon className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {stats && stats.earlyWarnings.length > 0 ? (
        <Card className="border-destructive/40 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-base">
              <AlertTriangle className="size-4 text-destructive" />
              Peringatan dini HDP
            </CardTitle>
            <CardDescription>
              Kandang dengan produksi hari ini di bawah 90% dari target HDP
              strain.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {stats.earlyWarnings.map((warning) => (
              <Link
                key={warning.cageId}
                href={`/dashboard/cages/${warning.cageId}`}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted/50"
              >
                <span className="font-medium">{warning.cageName}</span>
                <Badge variant="destructive">
                  {warning.actualHdp.toFixed(1)}% / target{" "}
                  {warning.targetHdp.toFixed(1)}%
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {stats && stats.lowStockItems.length > 0 ? (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-base">
              Stok kritis
            </CardTitle>
            <CardDescription>
              Item inventori di atau di bawah ambang batas minimum.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {stats.lowStockItems.map((item) => (
              <Link
                key={item.id}
                href={`/dashboard/inventory/${item.id}`}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted/50"
              >
                <span className="font-medium">{item.name}</span>
                <Badge variant="destructive">
                  {item.totalQuantity.toLocaleString("id-ID")} {item.unit} / min{" "}
                  {item.minStockAlert.toLocaleString("id-ID")}
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading">Sesi Anda</CardTitle>
            <CardDescription>
              Informasi akun dari Domain 1 (Auth & Tenant).
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <InfoRow label="Username" value={session.user.username} />
            <InfoRow label="Role" value={session.user.roleName} />
            <InfoRow
              label="Tenant aktif"
              value={activeTenant ?? "Global (superadmin)"}
            />
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading">Hak akses</CardTitle>
            <CardDescription>
              Permission dari RBAC — menu sidebar difilter otomatis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {session.user.permissions?.length ? (
                session.user.permissions.map((permission) => (
                  <Badge
                    key={permission}
                    variant="secondary"
                    className="bg-primary/10 text-primary hover:bg-primary/15"
                  >
                    {permission}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Tidak ada permission.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border/60 pb-2 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
