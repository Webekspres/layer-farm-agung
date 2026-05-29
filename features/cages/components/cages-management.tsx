"use client";

import { useActionState, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Pencil } from "lucide-react";
import { masterDataEmptyMessage } from "@/features/master-data/lib/empty-table-message";
import { listFiltersAreActive } from "@/features/master-data/lib/url-list-params";
import { useActionFeedback } from "@/components/shared/action-feedback";
import { CagesToolbar } from "@/features/cages/components/cages-toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createCageAction,
  type CageFormState,
} from "@/features/cages/actions/create-cage";
import { updateCageAction } from "@/features/cages/actions/update-cage";
import type { CageFormOptions, CageListItem } from "@/features/cages/types";

const formInitial: CageFormState = {};

type CagesManagementProps = {
  cages: CageListItem[];
  formOptions: CageFormOptions;
};

function CageFormFields({
  formOptions,
  editing,
  error,
  locationId,
  strainId,
  status,
  onLocationChange,
  onStrainChange,
  onStatusChange,
}: {
  formOptions: CageFormOptions;
  editing?: CageListItem | null;
  error?: string;
  locationId: string;
  strainId: string;
  status: string;
  onLocationChange: (value: string) => void;
  onStrainChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}) {
  const presets = [
    "Closed House (Battery)",
    "Open House (Battery)",
    "Open House (Floor/Postal)",
  ];

  const [selectedType, setSelectedType] = useState(() => {
    if (!editing?.cageType) return "";
    if (presets.includes(editing.cageType)) {
      return editing.cageType;
    }
    return "Lainnya";
  });

  const [customType, setCustomType] = useState(() => {
    if (!editing?.cageType) return "";
    if (presets.includes(editing.cageType)) {
      return "";
    }
    return editing.cageType;
  });

  return (
    <FieldGroup>
      <input type="hidden" name="locationId" value={locationId} />
      <input type="hidden" name="strainId" value={strainId} />
      <input type="hidden" name="status" value={status} />
      <Field>
        <FieldLabel htmlFor="cage-location">Lokasi</FieldLabel>
        <Select value={locationId} onValueChange={onLocationChange} required>
          <SelectTrigger id="cage-location">
            <SelectValue placeholder="Pilih lokasi" />
          </SelectTrigger>
          <SelectContent>
            {formOptions.locations.map((loc) => (
              <SelectItem key={loc.id} value={loc.id}>
                {loc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel htmlFor="cage-strain">Strain</FieldLabel>
        <Select value={strainId} onValueChange={onStrainChange} required>
          <SelectTrigger id="cage-strain">
            <SelectValue placeholder="Pilih strain" />
          </SelectTrigger>
          <SelectContent>
            {formOptions.strains.map((strain) => (
              <SelectItem key={strain.id} value={String(strain.id)}>
                {strain.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel htmlFor="cage-name">Nama kandang</FieldLabel>
        <Input
          id="cage-name"
          name="name"
          defaultValue={editing?.name}
          required
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="cage-type">Tipe (opsional)</FieldLabel>
        <input type="hidden" name="cageType" value={selectedType} />
        <input type="hidden" name="cageTypeCustom" value={customType} />
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger id="cage-type">
            <SelectValue placeholder="Pilih tipe kandang" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Closed House (Battery)">
              Closed House (Battery)
            </SelectItem>
            <SelectItem value="Open House (Battery)">
              Open House (Battery)
            </SelectItem>
            <SelectItem value="Open House (Floor/Postal)">
              Open House (Floor/Postal)
            </SelectItem>
            <SelectItem value="Lainnya">Lainnya</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      {selectedType === "Lainnya" && (
        <Field>
          <FieldLabel htmlFor="cage-type-custom">Tipe Kustom</FieldLabel>
          <Input
            id="cage-type-custom"
            value={customType}
            onChange={(e) => setCustomType(e.target.value)}
            placeholder="Masukkan tipe kustom Anda..."
            required
          />
        </Field>
      )}
      <Field>
        <FieldLabel htmlFor="cage-capacity">Kapasitas (ekor)</FieldLabel>
        <Input
          id="cage-capacity"
          name="capacity"
          type="number"
          min={1}
          defaultValue={editing?.capacity ?? ""}
          required
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="cage-status">Status</FieldLabel>
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger id="cage-status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Active">Aktif</SelectItem>
            <SelectItem value="Inactive">Nonaktif</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      {/* Temporarily bypass cycle inputs because backend is under development
      {!editing ? (
        <>
          <Field>
            <FieldLabel htmlFor="cycle-start">
              Mulai siklus (opsional)
            </FieldLabel>
            <Input id="cycle-start" name="cycleStartDate" type="date" />
          </Field>
          <Field>
            <FieldLabel htmlFor="cycle-pop">
              Populasi awal siklus (opsional)
            </FieldLabel>
            <Input
              id="cycle-pop"
              name="initialPopulation"
              type="number"
              min={1}
            />
          </Field>
        </>
      ) : null}
      */}
      {error ? <FieldError>{error}</FieldError> : null}
    </FieldGroup>
  );
}

export function CagesManagement({ cages, formOptions }: CagesManagementProps) {
  const searchParams = useSearchParams();
  const hasActiveFilter = listFiltersAreActive(searchParams, [
    "location",
    "strain",
    "status",
  ]);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<CageListItem | null>(null);
  const [createLocationId, setCreateLocationId] = useState(
    () => formOptions.locations[0]?.id ?? "",
  );
  const [createStrainId, setCreateStrainId] = useState(
    () => String(formOptions.strains[0]?.id ?? ""),
  );
  const [createStatus, setCreateStatus] = useState("Active");
  const [editLocationId, setEditLocationId] = useState("");
  const [editStrainId, setEditStrainId] = useState("");
  const [editStatus, setEditStatus] = useState("Active");
  const [createState, createAction, createPending] = useActionState(
    createCageAction,
    formInitial,
  );
  const [updateState, updateAction, updatePending] = useActionState(
    updateCageAction,
    formInitial,
  );

  useEffect(() => {
    if (createOpen) {
      setCreateLocationId(formOptions.locations[0]?.id ?? "");
      setCreateStrainId(String(formOptions.strains[0]?.id ?? ""));
      setCreateStatus("Active");
    }
  }, [createOpen, formOptions.locations, formOptions.strains]);

  useActionFeedback(createState, {
    successMessage: "Kandang berhasil ditambahkan.",
    onSuccess: () => setCreateOpen(false),
    when: createOpen,
  });

  useActionFeedback(updateState, {
    successMessage: "Kandang berhasil diperbarui.",
    onSuccess: () => setEditOpen(false),
    when: editOpen,
  });

  const canCreate =
    formOptions.locations.length > 0 && formOptions.strains.length > 0;

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <CagesToolbar
        locations={formOptions.locations}
        strains={formOptions.strains}
        onCreateClick={() => setCreateOpen(true)}
      />

      {!canCreate ? (
        <p className="text-sm text-muted-foreground">
          Tambahkan minimal satu lokasi dan satu strain sebelum membuat kandang.
        </p>
      ) : null}

      <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {cages.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            {masterDataEmptyMessage(
              hasActiveFilter,
              "Belum ada kandang. Tambah kandang setelah lokasi dan strain tersedia.",
            )}
          </div>
        ) : (
          <Table containerClassName="overflow-x-auto overscroll-x-contain">
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Kandang</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead>Strain</TableHead>
                <TableHead>Kapasitas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cages.map((cage) => (
                <TableRow key={cage.id}>
                  <TableCell className="font-medium">{cage.name}</TableCell>
                  <TableCell>{cage.locationName}</TableCell>
                  <TableCell>{cage.strainName}</TableCell>
                  <TableCell>{cage.capacity.toLocaleString("id-ID")}</TableCell>
                  <TableCell>
                    <Badge
                      variant={cage.status === "Active" ? "default" : "secondary"}
                    >
                      {cage.status === "Active" ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        setEditing(cage);
                        setEditLocationId(cage.locationId);
                        setEditStrainId(String(cage.strainId));
                        setEditStatus(cage.status);
                        setEditOpen(true);
                      }}
                    >
                      <Pencil className="size-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Tambah kandang</DialogTitle>
          </DialogHeader>
          <form action={createAction}>
            <CageFormFields
              key="create"
              formOptions={formOptions}
              error={createState.error}
              locationId={createLocationId}
              strainId={createStrainId}
              status={createStatus}
              onLocationChange={setCreateLocationId}
              onStrainChange={setCreateStrainId}
              onStatusChange={setCreateStatus}
            />
            <DialogFooter className="mt-4">
              <Button type="submit" disabled={createPending || !canCreate}>
                {createPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit kandang</DialogTitle>
          </DialogHeader>
          {editing ? (
            <form action={updateAction}>
              <input type="hidden" name="id" value={editing.id} />
              <CageFormFields
                key={editing.id}
                formOptions={formOptions}
                editing={editing}
                error={updateState.error}
                locationId={editLocationId}
                strainId={editStrainId}
                status={editStatus}
                onLocationChange={setEditLocationId}
                onStrainChange={setEditStrainId}
                onStatusChange={setEditStatus}
              />
              <DialogFooter className="mt-4">
                <Button type="submit" disabled={updatePending}>
                  {updatePending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  Simpan
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
