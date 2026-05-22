"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  signInWithIdentifier,
  type SignInState,
} from "@/features/auth/actions/sign-in";
import { cn } from "@/lib/utils";

const initialState: SignInState = {};

export default function LoginSplitScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, isPending] = useActionState(
    signInWithIdentifier,
    initialState,
  );

  return (
    <main className="grid min-h-svh w-full md:grid-cols-2">
      {/* Left: hero image + testimonial (hidden on mobile) */}
      <section
        className={cn(
          "relative hidden min-h-svh overflow-hidden md:block",
          "bg-muted",
        )}
        aria-hidden
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/image/login-bg-img.jpg')" }}
        />
        {/* Fixed dark overlay — not theme foreground (would wash out in dark mode) */}
        <div className="absolute inset-0 bg-linear-to-b from-black/25 via-black/45 to-black/75" />

        <div className="relative z-10 flex h-full flex-col justify-end p-8 lg:p-12">
          <div className="max-w-md rounded-2xl border border-white/15 bg-black/30 p-5 shadow-lg backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/90 text-sm font-semibold text-primary-foreground">
                AP
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Agung Petelur</p>
                <p className="text-xs text-white/70">Manajemen terintegrasi</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/90 italic">
              &ldquo;Kelola produksi, inventori, dan operasional kandang dalam satu
              platform terpadu.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* Right: login form (full width on mobile) */}
      <section className="relative flex min-h-svh flex-col bg-background px-6 py-8 sm:px-10 lg:px-14">
        <div className="flex items-center gap-3">
          <Image
            src="/image/Logo.png"
            alt="Layer Farm Agung"
            width={40}
            height={40}
            priority
            className="rounded-lg"
          />
          <span className="font-heading text-lg font-semibold tracking-tight text-foreground">
            Layer Farm Agung
          </span>
        </div>

        <div className="flex flex-1 flex-col justify-center py-10">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 space-y-2">
              <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Selamat datang kembali!
              </h1>
              <p className="text-sm text-muted-foreground sm:text-base">
                Masuk untuk mengelola peternakan ayam petelur Anda dengan aman.
              </p>
            </div>

            <form action={formAction} className="space-y-5">
              {state.error ? (
                <FieldError className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2">
                  {state.error}
                </FieldError>
              ) : null}

              <FieldGroup className="gap-5">
                <Field>
                  <FieldLabel htmlFor="identifier">Username / Email</FieldLabel>
                  <Input
                    id="identifier"
                    name="identifier"
                    type="text"
                    required
                    disabled={isPending}
                    placeholder="Masukkan username atau email"
                    autoComplete="username"
                    className="h-11"
                  />
                </Field>

                <Field>
                  <div className="flex items-center justify-between gap-2">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <a
                      href="#"
                      className="text-sm font-medium text-primary hover:text-primary/80 hover:underline"
                    >
                      Lupa password?
                    </a>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      disabled={isPending}
                      placeholder="Masukkan password"
                      autoComplete="current-password"
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground transition hover:text-foreground"
                      aria-label={
                        showPassword ? "Sembunyikan password" : "Tampilkan password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </Field>
              </FieldGroup>

              <label className="flex cursor-pointer select-none items-center gap-2">
                <input
                  type="checkbox"
                  className="size-4 rounded border-border accent-primary"
                />
                <span className="text-sm text-muted-foreground">Ingat saya</span>
              </label>

              <Button
                type="submit"
                disabled={isPending}
                className="h-11 w-full text-sm font-semibold"
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Masuk"
                )}
              </Button>
            </form>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Layer Farm Agung &copy; {new Date().getFullYear()}
        </p>
      </section>
    </main>
  );
}
