"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginSplitScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const isLoading = false;

  return (
    <main className="flex h-screen w-full overflow-hidden">

      {/* ── Left column: chicken background + content ── */}
      <div className="relative hidden md:flex md:w-5/12 shrink-0 flex-col justify-between p-8">

        {/* Chicken photo */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/image/login-bg-img.jpg')" }}
        />

        {/* Dark overlay */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(rgba(0,0,0,0.50), rgba(0,0,0,0.78))" }}
        />

        {/* Top: title */}
        <div className="relative z-10">
          <h2 className="text-xl font-bold text-white">Sistem Manajemen</h2>
          <p className="mt-1 text-sm text-white/70">Peternakan Ayam Petelur</p>
        </div>

        {/* Bottom: description + stats */}
        <div className="relative z-10 flex flex-col gap-3">
          <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <p className="text-sm leading-relaxed text-white/90">
              Platform terintegrasi untuk mengelola peternakan ayam petelur Anda
              secara efisien dan profesional.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "24/7", label: "Akses" },
              { value: "Real-time", label: "Monitoring" },
              { value: "Aman", label: "Data" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-white/20 bg-white/10 px-3 py-3 text-center backdrop-blur-sm"
              >
                <p className="text-sm font-semibold text-white">{stat.value}</p>
                <p className="mt-0.5 text-xs text-white/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right column: form ── */}
      <div className="flex w-full md:w-7/12 flex-col items-center justify-center bg-background px-8 py-10">
        <div className="w-full max-w-sm flex flex-col items-center gap-2">

          {/* Logo */}
          <Image
            src="/image/Logo.png"
            alt="Logo AAPM"
            width={80}
            height={80}
            priority
            className="rounded-xl"
          />

          {/* Heading */}
          <h1 className="mt-3 text-2xl font-bold text-foreground">
            Selamat datang di
          </h1>
          <p className="text-sm text-muted-foreground text-center">
            Sistem Manajemen Peternakan Ayam Petelur
          </p>

          {/* Form */}
          <form className="mt-6 w-full flex flex-col gap-4">

            {/* Username / Email */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="username"
                className="text-sm font-medium text-foreground/70"
              >
                Username/Email
              </label>

              <input
                id="username"
                type="text"
                placeholder="Masukkan username atau email"
                autoComplete="username"
                className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground/70"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-border bg-background py-2.5 pl-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground transition hover:text-foreground focus:outline-none"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember me + Lupa password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-border accent-primary cursor-pointer"
                />
                <span className="text-sm text-foreground/70">Remember me</span>
              </label>
              <a
                href="#"
                className="text-sm text-primary hover:text-primary-hover hover:underline hover:underline-offset-2 transition"
              >
                Lupa password?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-primary-hover active:bg-primary-active focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              Login
            </button>
          </form>
        </div>
      </div>

    </main>
  );
}
