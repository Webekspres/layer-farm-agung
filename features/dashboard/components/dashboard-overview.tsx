import { Egg, Package, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ServerSession } from "@/features/auth/lib/session";

type DashboardOverviewProps = {
  session: ServerSession;
};

const statCards = [
  {
    title: "Produksi hari ini",
    value: "—",
    description: "Butir telur tercatat",
    icon: Egg,
  },
  {
    title: "Populasi aktif",
    value: "—",
    description: "Ekor di semua kandang",
    icon: TrendingUp,
  },
  {
    title: "Stok kritis",
    value: "—",
    description: "Item di bawah minimum",
    icon: Package,
  },
  {
    title: "Pengguna aktif",
    value: "—",
    description: "Akun cabang aktif",
    icon: Users,
  },
] as const;

export function DashboardOverview({ session }: DashboardOverviewProps) {
  const displayName = session.user.fullName ?? session.user.name ?? "Pengguna";
  const activeSubdomain =
    session.session.activeSubdomainId ?? session.user.subdomainId;

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-heading text-foreground">
          Selamat datang, {displayName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ringkasan operasional peternakan ayam petelur Anda.
        </p>
      </div>

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
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading">
              Sesi Anda
            </CardTitle>
            <CardDescription>
              Informasi akun dari Domain 1 (Auth & Tenant).
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <InfoRow label="Username" value={session.user.username} />
            <InfoRow label="Role" value={session.user.roleName} />
            <InfoRow
              label="Subdomain aktif"
              value={activeSubdomain ?? "Global (superadmin)"}
            />
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading">
              Hak akses
            </CardTitle>
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
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-2 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
