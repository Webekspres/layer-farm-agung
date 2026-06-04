"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  recordDailyProductionAction,
  type RecordDailyProductionState,
} from "@/features/production/actions/record-daily-production";
import { crackRatioExceedsThreshold } from "@/features/production/lib/crack-ratio";
import type { CageForProduction } from "@/features/production/services/get-cage-for-production";

const initialState: RecordDailyProductionState = {};

type EggGradeOption = { id: number; name: string };

type DailyProductionFormProps = {
  cage: CageForProduction;
  eggGrades: EggGradeOption[];
  defaultRecordDate: string;
};

export function DailyProductionForm({
  cage,
  eggGrades,
  defaultRecordDate,
}: DailyProductionFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    recordDailyProductionAction,
    initialState,
  );
  const [eggGradeId, setEggGradeId] = useState(
    eggGrades[0] ? String(eggGrades[0].id) : "",
  );
  const [quantity, setQuantity] = useState("");
  const [eggCrack, setEggCrack] = useState("0");
  const [highCrackWarned, setHighCrackWarned] = useState(false);

  const qtyNum = Number(quantity) || 0;
  const crackNum = Number(eggCrack) || 0;
  const showCrackWarning = useMemo(
    () => crackRatioExceedsThreshold(qtyNum, crackNum),
    [qtyNum, crackNum],
  );

  useActionFeedback(state, {
    successMessage: "Produksi harian berhasil disimpan.",
    onSuccess: () => router.push("/kandang"),
  });

  useEffect(() => {
    if (showCrackWarning && !highCrackWarned) {
      setHighCrackWarned(true);
      toast.warning(
        "Telur pecah melebihi 5% dari total panen. Periksa kembali sebelum menyimpan.",
      );
    }
    if (!showCrackWarning) {
      setHighCrackWarned(false);
    }
  }, [showCrackWarning, highCrackWarned]);

  const canSubmit =
    cage.status === "Active" &&
    cage.hasActiveCycle &&
    eggGrades.length > 0 &&
    !isPending;

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="cageId" value={cage.id} />

      <FieldGroup className="gap-5">
        <Field>
          <FieldLabel htmlFor="recordDate">Tanggal panen</FieldLabel>
          <Input
            id="recordDate"
            name="recordDate"
            type="date"
            required
            defaultValue={defaultRecordDate}
            disabled={isPending}
            className="min-h-11"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="eggGradeId">Grade telur</FieldLabel>
          <input type="hidden" name="eggGradeId" value={eggGradeId} />
          <Select
            value={eggGradeId}
            onValueChange={setEggGradeId}
            required
            disabled={isPending || eggGrades.length === 0}
          >
            <SelectTrigger
              id="eggGradeId"
              className="min-h-11 w-full"
              aria-label="Grade telur"
            >
              <SelectValue placeholder="Pilih grade" />
            </SelectTrigger>
            <SelectContent>
              {eggGrades.map((grade) => (
                <SelectItem key={grade.id} value={String(grade.id)}>
                  {grade.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="quantity">Jumlah telur layak (butir)</FieldLabel>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            inputMode="numeric"
            min={0}
            max={10000}
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            disabled={isPending}
            placeholder="0"
            className="min-h-11 text-lg tabular-nums"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="eggCrack">Jumlah telur pecah (butir)</FieldLabel>
          <Input
            id="eggCrack"
            name="eggCrack"
            type="number"
            inputMode="numeric"
            min={0}
            max={10000}
            required
            value={eggCrack}
            onChange={(e) => setEggCrack(e.target.value)}
            disabled={isPending}
            className={
              showCrackWarning
                ? "min-h-11 border-chart-4 text-chart-4 focus-visible:ring-chart-4/40"
                : "min-h-11"
            }
          />
          {showCrackWarning ? (
            <p className="text-sm text-chart-4">
              Telur pecah &gt; 5% dari total panen ({qtyNum + crackNum} butir).
            </p>
          ) : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="weight">
            Total berat (kg) <span className="text-muted-foreground">opsional</span>
          </FieldLabel>
          <Input
            id="weight"
            name="weight"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            disabled={isPending}
            placeholder="0"
            className="min-h-11"
          />
        </Field>

        {state.error ? <FieldError>{state.error}</FieldError> : null}
      </FieldGroup>

      {!cage.hasActiveCycle ? (
        <p className="text-sm text-destructive">
          Kandang belum memiliki siklus aktif. Hubungi admin sebelum mencatat
          produksi.
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={!canSubmit}
        className="min-h-11 w-full text-base font-semibold"
      >
        {isPending ? (
          <>
            <Loader2 className="size-5 animate-spin" />
            Menyimpan...
          </>
        ) : (
          "Simpan produksi"
        )}
      </Button>
    </form>
  );
}
