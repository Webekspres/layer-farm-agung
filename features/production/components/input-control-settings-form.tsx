"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { useActionFeedback } from "@/components/shared/action-feedback";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  updateProductionInputSettingAction,
  type ProductionInputSettingFormState,
} from "@/features/production/actions/update-production-input-setting";
import type { ProductionInputSetting } from "@/features/production/services/get-production-input-setting";

const formInitial: ProductionInputSettingFormState = {};

type InputControlSettingsFormProps = {
  setting: ProductionInputSetting;
};

export function InputControlSettingsForm({
  setting,
}: InputControlSettingsFormProps) {
  const [state, action, pending] = useActionState(
    updateProductionInputSettingAction,
    formInitial,
  );

  useActionFeedback(state, {
    successMessage: "Kebijakan input berhasil disimpan.",
  });

  return (
    <form action={action} className="flex min-w-0 flex-col gap-4">
      <div className="min-w-0 rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-heading text-base font-semibold">
          Batas input &amp; koreksi tanggal
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Staf lapangan dan administrator hanya dapat mengisi / mengoreksi data
          untuk tanggal dalam batas hari ke belakang ini. Tanggal di masa depan
          atau sebelum start_date siklus aktif selalu ditolak.
        </p>

        <FieldGroup className="mt-5">
          <Field>
            <FieldLabel htmlFor="staff-lookback">
              Staf lapangan — maksimal (hari)
            </FieldLabel>
            <Input
              id="staff-lookback"
              name="staff_lookback_days"
              type="number"
              min={0}
              max={365}
              defaultValue={setting.staffLookbackDays}
              required
            />
            <p className="text-xs text-muted-foreground">
              Default 7 hari. Berlaku untuk staf dengan peran “staff”.
            </p>
          </Field>
          <Field>
            <FieldLabel htmlFor="admin-lookback">
              Administrator — maksimal (hari)
            </FieldLabel>
            <Input
              id="admin-lookback"
              name="admin_lookback_days"
              type="number"
              min={0}
              max={365}
              defaultValue={setting.adminLookbackDays}
              required
            />
            <p className="text-xs text-muted-foreground">
              Default 30 hari. Berlaku untuk admin / superadmin.
            </p>
          </Field>
          {state.error ? <FieldError>{state.error}</FieldError> : null}
        </FieldGroup>

        <Button type="submit" disabled={pending} className="mt-5">
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          Simpan kebijakan
        </Button>
      </div>
    </form>
  );
}
