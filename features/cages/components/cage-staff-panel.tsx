"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";

import { useActionFeedback } from "@/components/shared/action-feedback";
import { Button } from "@/components/ui/button";
import { updateCageStaffAction } from "@/features/cages/actions/update-cage-staff";
import type { TenantStaffOption } from "@/features/cages/services/list-tenant-staff-options";

type CageStaffPanelProps = {
  cageId: string;
  staffOptions: TenantStaffOption[];
  assignedStaffIds: string[];
};

export function CageStaffPanel({
  cageId,
  staffOptions,
  assignedStaffIds,
}: CageStaffPanelProps) {
  const [state, action, pending] = useActionState(updateCageStaffAction, {});

  useActionFeedback(state, {
    successMessage: "Penugasan staff kandang diperbarui.",
  });

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-1 text-lg font-bold tracking-tight text-foreground">
        Staff Kandang
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Hanya staff yang ditugaskan di sini yang dapat scan QR dan input produksi
        harian di aplikasi mobile.
      </p>

      <form action={action} className="space-y-4">
        <input type="hidden" name="cageId" value={cageId} />

        {staffOptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Belum ada akun staff aktif di tenant ini.
          </p>
        ) : (
          <ul className="space-y-3">
            {staffOptions.map((staff) => (
              <li key={staff.id}>
                <label className="flex cursor-pointer items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    name="staffIds"
                    value={staff.id}
                    defaultChecked={assignedStaffIds.includes(staff.id)}
                    className="size-4 rounded border-border accent-primary"
                  />
                  <span>
                    {staff.fullName}{" "}
                    <span className="text-muted-foreground">({staff.username})</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={pending || staffOptions.length === 0}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            Simpan penugasan
          </Button>
        </div>
      </form>
    </div>
  );
}
