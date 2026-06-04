"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";

type Props = {
  displayName: string;
  roleName: string;
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat Pagi";
  if (hour < 15) return "Selamat Siang";
  if (hour < 19) return "Selamat Sore";
  return "Selamat Malam";
}

function getTodayLabel() {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

function getRoleLabel(roleName: string) {
  const map: Record<string, string> = {
    staff: "Staff Kandang",
    admin: "Admin Peternakan",
    superadmin: "Super Admin",
  };
  return map[roleName] ?? roleName;
}

export function FieldHomeHeader({ displayName, roleName }: Props) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  return (
    <div className="relative overflow-hidden bg-primary px-4 pb-6 pt-10">
      {/* subtle background texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 80% 20%, white 0%, transparent 60%)",
        }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          {/* Online / offline badge */}
          <div
            className={`mb-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
              isOnline
                ? "bg-white/20 text-primary-foreground"
                : "bg-destructive/30 text-primary-foreground"
            }`}
          >
            {isOnline ? (
              <Wifi className="size-3.5" />
            ) : (
              <WifiOff className="size-3.5" />
            )}
            {isOnline ? "Online" : "Offline"}
          </div>

          <p className="font-heading text-2xl font-bold leading-tight text-primary-foreground">
            {getGreeting()},{" "}
            <span className="whitespace-nowrap">
              {displayName.split(" ")[0]}! 👋
            </span>
          </p>
          <p className="mt-0.5 text-sm font-medium text-primary-foreground/80">
            {getRoleLabel(roleName)} · {getTodayLabel()}
          </p>

          {/* App badge */}
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1">
            <Image
              src="/image/Logo.png"
              alt="AAPM"
              width={16}
              height={16}
              className="rounded-sm"
            />
            <span className="text-xs font-semibold text-primary-foreground">
              AAPM Mobile
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
