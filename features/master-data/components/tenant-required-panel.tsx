import { Building2 } from "lucide-react";

export function TenantRequiredPanel() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center">
      <Building2 className="size-10 text-muted-foreground" />
      <div className="max-w-md space-y-1">
        <p className="font-medium">Pilih tenant aktif</p>
        <p className="text-sm text-muted-foreground">
          Data master per tenant membutuhkan konteks tenant. Gunakan pemilih tenant
          di header untuk melanjutkan.
        </p>
      </div>
    </div>
  );
}
