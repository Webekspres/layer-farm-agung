import Link from "next/link";
import { ChevronRight, CheckCircle2, Clock, QrCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  getProductionTenantScope,
  requireManageProductionSession,
} from "@/features/production/lib/access";
import { listFieldCages } from "@/features/production/services/list-field-cages";
import { FieldHomeHeader } from "@/features/production/components/field-home-header";

export default async function FieldCagesPage() {
  const session = await requireManageProductionSession();
  const { tenantId, needsTenantSelection } = getProductionTenantScope(session);

  const displayName =
    session.user.fullName ?? session.user.name ?? session.user.username;
  const roleName = session.user.roleName;

  if (needsTenantSelection || !tenantId) {
    return (
      <div className="flex flex-col gap-3 p-4">
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Pilih kandang
        </h1>
        <p className="text-sm text-muted-foreground">
          Akun global: pilih tenant aktif di header dashboard terlebih dahulu,
          lalu buka halaman ini lagi.
        </p>
      </div>
    );
  }

  const { cages, totalActive, recordedTodayCount } =
    await listFieldCages(tenantId);

  const progressPct =
    totalActive > 0 ? Math.round((recordedTodayCount / totalActive) * 100) : 0;

  return (
    <div className="flex flex-col">
      {/* Hero header */}
      <FieldHomeHeader
        displayName={displayName}
        roleName={roleName}
      />

      {/* Page body */}
      <div className="flex flex-col gap-4 px-4 pt-4 pb-4">
        {/* Progress card */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Tugas Kandang Hari Ini
            </p>
            <span className="font-heading text-xl font-bold text-primary tabular-nums">
              {recordedTodayCount}/{totalActive}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {recordedTodayCount} kandang selesai diinput
            </p>
            <p
              className={
                progressPct === 100
                  ? "text-xs font-semibold text-primary"
                  : "text-xs font-semibold text-chart-4"
              }
            >
              {progressPct}%
            </p>
          </div>

          {/* QR scan CTA */}
          <Link
            href="/input-harian"
            className="mt-4 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 font-semibold text-primary-foreground transition hover:bg-primary/90 active:scale-[0.98]"
          >
            <QrCode className="size-5" />
            Scan QR Kandang Baru
          </Link>
        </div>

        {/* Cage list */}
        {cages.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="px-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Daftar Kandang Ditugaskan
            </p>

            <ul className="flex flex-col gap-2">
              {cages.map((cage) => (
                <li key={cage.id}>
                  <Link
                    href={`/kandang/${cage.id}/produksi`}
                    className="flex min-h-[68px] items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm transition hover:border-primary/40 hover:bg-primary/5 active:scale-[0.99]"
                  >
                    {/* Status icon */}
                    {cage.recordedToday ? (
                      <CheckCircle2 className="size-7 shrink-0 text-primary" />
                    ) : (
                      <Clock className="size-7 shrink-0 text-chart-4" />
                    )}

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold leading-snug">
                        {cage.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        ID: {cage.id.slice(0, 6).toUpperCase()}
                      </p>
                    </div>

                    {/* Status badge */}
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge
                        variant={cage.recordedToday ? "default" : "secondary"}
                        className={
                          cage.recordedToday
                            ? "bg-primary/10 text-primary hover:bg-primary/10"
                            : "bg-chart-4/10 text-chart-4 hover:bg-chart-4/10"
                        }
                      >
                        {cage.recordedToday ? "Selesai" : "Belum Diinput"}
                      </Badge>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {cages.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Belum ada kandang aktif. Hubungi admin untuk menambah kandang dan
            siklus.
          </div>
        )}
      </div>
    </div>
  );
}
