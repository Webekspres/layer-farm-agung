"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  Building2,
  CloudOff,
  IdCard,
  LogOut,
  Monitor,
  Moon,
  RefreshCw,
  ShieldCheck,
  Sun,
  UserRound,
  Wifi,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/features/auth/client/auth-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ServerSession } from "@/features/auth/lib/session";

type Props = {
  session: ServerSession;
  tenantName: string | null;
};

const THEME_OPTIONS = [
  { value: "light", label: "Terang", icon: Sun },
  { value: "dark", label: "Gelap", icon: Moon },
  { value: "system", label: "Sistem", icon: Monitor },
] as const;

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function getRoleLabel(roleName: string) {
  const map: Record<string, string> = {
    staff: "Staff Kandang",
    admin: "Admin Peternakan",
    superadmin: "Super Admin",
  };
  return map[roleName] ?? roleName;
}

type InfoRowProps = {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
};

function InfoRow({ icon: Icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 py-3 last:border-0">
      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
        <Icon className="size-4 shrink-0" />
        {label}
      </div>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export function FieldProfilePanel({ session, tenantName }: Props) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const displayName =
    session.user.fullName ?? session.user.name ?? session.user.username;
  const initials = getInitials(displayName);

  useEffect(() => {
    setMounted(true);
    setIsOnline(navigator.onLine);
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  async function handleSignOut() {
    await authClient.signOut();
    window.location.href = "/login";
  }

  async function handleManualSync() {
    if (!isOnline) {
      toast.error("Tidak ada koneksi internet. Coba lagi saat online.");
      return;
    }
    setSyncing(true);
    // TODO: flush local SyncQueue to server when offline engine is implemented.
    await new Promise((r) => setTimeout(r, 1200));
    setSyncing(false);
    toast.success("Sinkronisasi selesai.");
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="bg-primary px-4 pb-8 pt-10">
        <div className="flex flex-col items-center gap-3">
          <div className="flex size-20 items-center justify-center rounded-full bg-white/20 font-heading text-2xl font-bold text-primary-foreground">
            {initials}
          </div>
          <div className="text-center">
            <p className="font-heading text-xl font-bold text-primary-foreground">
              {displayName}
            </p>
            <p className="mt-0.5 text-sm text-primary-foreground/80">
              {getRoleLabel(session.user.roleName)}
            </p>
            {tenantName && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1">
                <Building2 className="size-3.5 text-primary-foreground/80" />
                <span className="text-xs font-semibold text-primary-foreground">
                  {tenantName}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-4 px-4 py-5">
        {/* Account info card */}
        <div className="rounded-2xl border border-border bg-card px-4 shadow-sm">
          <p className="pt-3 pb-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Informasi Akun
          </p>
          <InfoRow
            icon={UserRound}
            label="Nama Lengkap"
            value={displayName}
          />
          <InfoRow
            icon={IdCard}
            label="Username"
            value={session.user.username}
          />
          <InfoRow
            icon={ShieldCheck}
            label="Peran"
            value={getRoleLabel(session.user.roleName)}
          />
          {tenantName && (
            <InfoRow
              icon={Building2}
              label="Nama Peternakan"
              value={tenantName}
            />
          )}
          <InfoRow
            icon={isOnline ? Wifi : WifiOff}
            label="Status Koneksi"
            value={
              <span className={isOnline ? "text-primary" : "text-destructive"}>
                {isOnline ? "Terhubung ke Internet" : "Tidak ada koneksi"}
              </span>
            }
          />
        </div>

        {/* Theme toggle card */}
        <div className="rounded-2xl border border-border bg-card px-4 py-4 shadow-sm">
          <p className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Tampilan
          </p>
          <div className="grid grid-cols-3 gap-2">
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
              const active = mounted && theme === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTheme(value)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-medium transition ${
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  <Icon className="size-5" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sync queue card */}
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-4 shadow-sm">
          <div className="flex items-center gap-2 text-destructive">
            <CloudOff className="size-5 shrink-0" />
            <p className="text-sm font-semibold">Antrean Sinkronisasi Data Lokal</p>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <p className="font-heading text-3xl font-bold text-destructive">0</p>
            <p className="text-sm text-muted-foreground">
              {isOnline
                ? "Semua data tersinkronisasi"
                : "Data menunggu sinyal internet"}
            </p>
          </div>

          <Button
            variant="outline"
            onClick={handleManualSync}
            disabled={syncing}
            className="mt-4 min-h-11 w-full border-primary text-primary hover:bg-primary/10"
          >
            <RefreshCw className={`size-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Menyinkronkan..." : "Sinkronisasi Manual"}
          </Button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          AAPM Mobile v1.0.0 · © 2026 Agung Petelur
        </p>

        {/* Sign out */}
        <Button
          variant="outline"
          onClick={handleSignOut}
          className="min-h-12 w-full border-destructive/40 text-destructive hover:bg-destructive/10"
        >
          <LogOut className="size-4" />
          Keluar Aplikasi / Sign Out
        </Button>
      </div>
    </div>
  );
}
