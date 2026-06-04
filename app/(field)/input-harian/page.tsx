import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { QrCagePicker } from "@/features/production/components/qr-cage-picker";
import {
  getProductionTenantScope,
  requireManageProductionSession,
} from "@/features/production/lib/access";
import { listFieldCages } from "@/features/production/services/list-field-cages";

export default async function InputHarianPage() {
  const session = await requireManageProductionSession();
  const { tenantId, needsTenantSelection } = getProductionTenantScope(session);

  if (needsTenantSelection || !tenantId) {
    return (
      <div className="flex flex-col gap-4 px-4 pt-6">
        <p className="text-sm text-muted-foreground">
          Pilih tenant aktif terlebih dahulu.
        </p>
      </div>
    );
  }

  const { cages } = await listFieldCages(tenantId);

  return (
    <div className="flex flex-col">
      {/* Simple top bar */}
      <div className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex min-h-14 items-center gap-2 px-4">
          <Link
            href="/kandang"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Kembali"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <h1 className="font-heading text-base font-semibold">
            Scan QR Kandang
          </h1>
        </div>
      </div>

      <div className="px-4 py-5">
        <QrCagePicker cages={cages} />
      </div>
    </div>
  );
}
