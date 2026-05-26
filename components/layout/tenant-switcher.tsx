"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Building2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { switchActiveTenantAction } from "@/features/tenants/actions/switch-active-tenant";

type TenantOption = { id: string; name: string };

type TenantSwitcherProps = {
  tenants: TenantOption[];
  activeTenantId: string | null;
};

export function TenantSwitcher({
  tenants,
  activeTenantId,
}: TenantSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const value = activeTenantId ?? "global";

  function handleChange(next: string) {
    const tenantId = next === "global" ? null : next;
    startTransition(async () => {
      const result = await switchActiveTenantAction(tenantId);
      if (result.success) {
        router.refresh();
      }
    });
  }

  return (
    <div className="hidden min-w-0 items-center gap-2 md:flex">
      <Building2 className="size-4 shrink-0 text-muted-foreground" />
      <Select value={value} onValueChange={handleChange} disabled={isPending}>
        <SelectTrigger className="h-8 w-full min-w-[140px] max-w-[200px]" size="sm">
          <SelectValue placeholder="Pilih tenant" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="global">Global</SelectItem>
          {tenants.map((tenant) => (
            <SelectItem key={tenant.id} value={tenant.id}>
              {tenant.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
