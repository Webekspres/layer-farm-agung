"use client";

import { WifiOff, RefreshCw } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-md text-center space-y-6">
        {/* Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <WifiOff className="h-10 w-10 text-muted-foreground" />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-2xl font-heading font-bold tracking-tight">
            Anda Sedang Offline
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Sepertinya koneksi internet Anda terputus. Periksa jaringan Anda dan
            coba lagi.
          </p>
        </div>

        {/* Retry button */}
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <RefreshCw className="h-4 w-4" />
          Coba Lagi
        </button>

        <p className="text-xs text-muted-foreground/70">
          Halaman yang pernah Anda kunjungi mungkin masih tersedia secara offline.
        </p>
      </div>
    </div>
  );
}
