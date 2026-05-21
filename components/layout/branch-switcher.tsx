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
import { switchActiveSubdomainAction } from "@/features/tenant/actions/switch-active-subdomain";

type BranchOption = { id: string; name: string };

type BranchSwitcherProps = {
  branches: BranchOption[];
  activeSubdomainId: string | null;
};

export function BranchSwitcher({
  branches,
  activeSubdomainId,
}: BranchSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const value = activeSubdomainId ?? "global";

  function handleChange(next: string) {
    const subdomainId = next === "global" ? null : next;
    startTransition(async () => {
      const result = await switchActiveSubdomainAction(subdomainId);
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
          <SelectValue placeholder="Pilih cabang" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="global">Global</SelectItem>
          {branches.map((branch) => (
            <SelectItem key={branch.id} value={branch.id}>
              {branch.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
