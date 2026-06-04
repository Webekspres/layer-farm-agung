import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { listEggGradeOptions } from "@/features/egg-grades/services/list-egg-grade-options";
import { DailyProductionForm } from "@/features/production/components/daily-production-form";
import {
  getProductionTenantScope,
  requireManageProductionSession,
} from "@/features/production/lib/access";
import { getCageForProduction } from "@/features/production/services/get-cage-for-production";

type PageProps = {
  params: Promise<{ cageId: string }>;
};

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export default async function CageProductionPage({ params }: PageProps) {
  const { cageId } = await params;
  const session = await requireManageProductionSession();
  const { tenantId, needsTenantSelection } = getProductionTenantScope(session);

  if (needsTenantSelection || !tenantId) {
    return (
      <p className="p-4 text-sm text-muted-foreground">
        Pilih tenant aktif terlebih dahulu.
      </p>
    );
  }

  const [cage, eggGrades] = await Promise.all([
    getCageForProduction(tenantId, cageId),
    listEggGradeOptions(),
  ]);

  if (!cage) {
    notFound();
  }

  return (
    <div className="flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex min-h-14 items-center gap-2 px-4">
          <Link
            href="/kandang"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Kembali"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-heading text-base font-semibold">
              {cage.name}
            </h1>
            <p className="truncate text-xs text-muted-foreground">
              {cage.locationName} · {cage.strainName}
            </p>
          </div>
          <Badge
            variant={cage.status === "Active" ? "default" : "secondary"}
            className={
              cage.status === "Active"
                ? "bg-primary/10 text-primary hover:bg-primary/10"
                : ""
            }
          >
            {cage.status === "Active" ? "Aktif" : cage.status}
          </Badge>
        </div>
      </div>

      {/* Hero population strip */}
      {cage.activeCyclePopulation != null && (
        <div className="bg-primary/5 px-4 py-3 border-b border-border">
          <p className="text-xs text-muted-foreground">Populasi siklus aktif</p>
          <p className="font-heading text-2xl font-bold text-primary tabular-nums">
            {cage.activeCyclePopulation.toLocaleString("id-ID")}{" "}
            <span className="text-sm font-normal text-muted-foreground">ekor</span>
          </p>
        </div>
      )}

      {cage.activeCyclePopulation === null && (
        <div className="bg-chart-4/10 px-4 py-3 border-b border-chart-4/30">
          <p className="text-sm font-medium text-chart-4">
            Tidak ada siklus aktif — produksi tidak dapat disimpan. Hubungi
            admin.
          </p>
        </div>
      )}

      {/* Form body */}
      <div className="px-4 py-5">
        <DailyProductionForm
          cage={cage}
          eggGrades={eggGrades}
          defaultRecordDate={todayIsoDate()}
        />
      </div>
    </div>
  );
}
