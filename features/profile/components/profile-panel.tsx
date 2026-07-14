"use client";

import { useActionState, useState, useRef, useCallback } from "react";
import { useActionFeedback } from "@/components/shared/action-feedback";
import { Loader2, Upload, X, ImageIcon, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  changeOwnPasswordAction,
  type ChangeOwnPasswordState,
} from "@/features/profile/actions/change-own-password";
import {
  updateTenantBrandingAction,
  type UpdateTenantBrandingState,
} from "@/features/profile/actions/update-tenant-branding";
import type { ServerSession } from "@/features/auth/lib/session";

const initialState: ChangeOwnPasswordState = {};
const initialBrandState: UpdateTenantBrandingState = {};

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"];
const MAX_SIZE_MB = 2;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

type TenantBranding = {
  name: string;
  brand_name: string | null;
  logo_url: string | null;
};

type ProfilePanelProps = {
  session: ServerSession;
  tenantBranding?: TenantBranding | null;
};

type UploadStatus = "idle" | "uploading" | "success" | "error";

export function ProfilePanel({ session, tenantBranding = null }: ProfilePanelProps) {
  const [state, formAction, isPending] = useActionState(
    changeOwnPasswordAction,
    initialState,
  );

  const [brandState, brandFormAction, isBrandPending] = useActionState(
    updateTenantBrandingAction,
    initialBrandState,
  );

  // Logo upload states
  const [currentLogoUrl, setCurrentLogoUrl] = useState(
    tenantBranding?.logo_url ?? null,
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useActionFeedback(state, {
    successMessage: "Password berhasil diubah.",
  });

  useActionFeedback(brandState, {
    successMessage: "Konfigurasi branding berhasil diperbarui.",
  });

  const activeTenant =
    session.session.activeTenantId ?? session.user.tenantId;

  const isTenantAdmin = session.user.roleName === "admin" && session.user.tenantId !== null;

  const validateAndSetFile = useCallback((file: File) => {
    setUploadError(null);
    setUploadStatus("idle");

    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError("Format tidak didukung. Gunakan PNG, JPG, WEBP, atau SVG.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setUploadError(`Ukuran file melebihi batas ${MAX_SIZE_MB} MB.`);
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setUploadStatus("idle");
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleLogoUpload = async () => {
    if (!selectedFile) return;
    setUploadStatus("uploading");
    setUploadError(null);

    const fd = new FormData();
    fd.append("logo", selectedFile);

    try {
      const res = await fetch("/api/upload/logo", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();

      if (!res.ok) {
        setUploadStatus("error");
        setUploadError(data.error ?? "Gagal mengunggah logo.");
        return;
      }

      setUploadStatus("success");
      setCurrentLogoUrl(data.logoUrl);
      clearSelectedFile();
    } catch {
      setUploadStatus("error");
      setUploadError("Terjadi kesalahan jaringan. Coba lagi.");
    }
  };

  const displayLogo = previewUrl ?? currentLogoUrl;

  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-2 lg:gap-6">
      {/* Left Column: Account Information & Brand Customization */}
      <div className="flex flex-col gap-4 lg:gap-6">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading">Informasi akun</CardTitle>
            <CardDescription>Data sesi login Anda saat ini.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <Row label="Nama" value={session.user.fullName ?? session.user.name ?? "—"} />
            <Row label="Username" value={session.user.username} />
            <Row label="Email" value={session.user.email ?? "—"} />
            <Row label="Peran" value={session.user.roleName} />
            <Row
              label="Cabang aktif"
              value={activeTenant ? "Tenant terikat" : "Global"}
            />
            <div className="flex flex-wrap gap-2 pt-1">
              {session.user.permissions?.map((p) => (
                <Badge key={p} variant="secondary" className="capitalize">
                  {p.replaceAll("_", " ")}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {isTenantAdmin && tenantBranding ? (
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="font-heading">Kustomisasi brand</CardTitle>
              <CardDescription>
                Atur nama brand dan unggah logo kustom untuk dashboard white-label Anda.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {/* Brand Name Form */}
              <form action={brandFormAction} className="flex flex-col gap-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="brandName">Nama Brand (Kustom)</FieldLabel>
                    <Input
                      id="brandName"
                      name="brandName"
                      type="text"
                      placeholder={`Nama default: ${tenantBranding.name}`}
                      defaultValue={tenantBranding.brand_name ?? ""}
                      disabled={isBrandPending}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Meninggalkan kolom ini kosong akan menggunakan nama default &quot;{tenantBranding.name}&quot;.
                    </p>
                  </Field>
                  {brandState.error ? <FieldError>{brandState.error}</FieldError> : null}
                </FieldGroup>
                <Button type="submit" disabled={isBrandPending} className="w-full sm:w-auto">
                  {isBrandPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan nama brand"
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="border-t border-border/60" />

              {/* Logo Upload Section */}
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-sm font-medium leading-none">Logo Kustom</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, WEBP, atau SVG. Maks. {MAX_SIZE_MB} MB.
                  </p>
                </div>

                {/* Current Logo Preview */}
                {currentLogoUrl && !previewUrl && (
                  <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
                    <div className="size-12 shrink-0 rounded-md border border-border bg-background p-1 flex items-center justify-center">
                      <img
                        src={currentLogoUrl}
                        alt="Logo saat ini"
                        className="size-full object-contain rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">Logo aktif</p>
                      <p className="text-xs text-muted-foreground truncate">{currentLogoUrl}</p>
                    </div>
                  </div>
                )}

                {/* File selected — preview & upload button */}
                {selectedFile && previewUrl ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 rounded-lg border border-primary/40 bg-primary/5 p-3">
                      <div className="size-14 shrink-0 rounded-md border border-border bg-background p-1 flex items-center justify-center">
                        <img
                          src={previewUrl}
                          alt="Preview logo baru"
                          className="size-full object-contain rounded"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={clearSelectedFile}
                        className="shrink-0 rounded-full p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        aria-label="Hapus file"
                      >
                        <X className="size-4" />
                      </button>
                    </div>

                    {uploadError && (
                      <p className="text-xs text-destructive">{uploadError}</p>
                    )}

                    <Button
                      type="button"
                      onClick={handleLogoUpload}
                      disabled={uploadStatus === "uploading"}
                      className="w-full sm:w-auto"
                    >
                      {uploadStatus === "uploading" ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Mengunggah...
                        </>
                      ) : (
                        <>
                          <Upload className="size-4" />
                          Unggah logo
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  /* Drop zone */
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={[
                      "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors duration-200",
                      isDragOver
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border/60 hover:border-primary/50 hover:bg-muted/30 text-muted-foreground",
                    ].join(" ")}
                  >
                    <div className={[
                      "flex size-10 items-center justify-center rounded-full transition-colors",
                      isDragOver ? "bg-primary/15" : "bg-muted",
                    ].join(" ")}>
                      {uploadStatus === "success" ? (
                        <CheckCircle2 className="size-5 text-green-500" />
                      ) : (
                        <ImageIcon className="size-5" />
                      )}
                    </div>
                    {uploadStatus === "success" ? (
                      <p className="text-xs font-medium text-green-600">Logo berhasil diunggah!</p>
                    ) : (
                      <>
                        <p className="text-xs font-medium">
                          Drag & drop atau{" "}
                          <span className="text-primary underline underline-offset-2">klik untuk memilih</span>
                        </p>
                        <p className="text-xs">PNG, JPG, WEBP, SVG · Maks. {MAX_SIZE_MB} MB</p>
                      </>
                    )}
                  </div>
                )}

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ALLOWED_TYPES.join(",")}
                  onChange={handleFileChange}
                  className="sr-only"
                  aria-label="Pilih file logo"
                />

                {uploadError && !selectedFile && (
                  <p className="text-xs text-destructive">{uploadError}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>

      {/* Right Column: Password Customization */}
      <div className="flex flex-col gap-4 lg:gap-6">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading">Ubah password</CardTitle>
            <CardDescription>
              Gunakan password kuat minimal 8 karakter.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="flex flex-col gap-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="currentPassword">Password saat ini</FieldLabel>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    required
                    disabled={isPending}
                    autoComplete="current-password"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="newPassword">Password baru</FieldLabel>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    minLength={8}
                    required
                    disabled={isPending}
                    autoComplete="new-password"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="confirmPassword">Konfirmasi password</FieldLabel>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    minLength={8}
                    required
                    disabled={isPending}
                    autoComplete="new-password"
                  />
                </Field>
                {state.error ? <FieldError>{state.error}</FieldError> : null}
              </FieldGroup>
              <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan password"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border/60 pb-2 last:border-0 sm:flex-row sm:justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium capitalize">{value}</span>
    </div>
  );
}
