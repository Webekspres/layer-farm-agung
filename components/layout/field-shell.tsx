"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PlusCircle, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type FieldShellProps = {
  children: React.ReactNode;
};

const NAV_ITEMS = [
  {
    href: "/kandang",
    label: "Dashboard",
    icon: LayoutDashboard,
    /** Active when exactly on /kandang or /kandang/[id]/produksi etc. */
    matchExact: false,
    /**
     * Do NOT mark active when on /input-harian or /profil.
     * We check that no other nav item matches first.
     */
  },
  {
    href: "/input-harian",
    label: "Input Harian",
    icon: PlusCircle,
    matchExact: false,
  },
  {
    href: "/profil",
    label: "Profil",
    icon: UserCircle,
    matchExact: false,
  },
] as const;

export function FieldShell({ children }: FieldShellProps) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/kandang") {
      // Dashboard active when on /kandang (exact) or kandang sub-pages BUT
      // not when on /input-harian or /profil.
      return (
        pathname === "/kandang" ||
        (pathname.startsWith("/kandang/") &&
          !pathname.startsWith("/input-harian") &&
          !pathname.startsWith("/profil"))
      );
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col pb-24">
        {children}
      </main>

      {/* Bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background safe-area-inset-bottom"
        aria-label="Navigasi lapangan"
      >
        <div className="mx-auto flex w-full max-w-lg items-stretch px-2 py-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            const isCenter = href === "/input-harian";

            if (isCenter) {
              return (
                <Link
                  key={href}
                  href={href}
                  aria-label={label}
                  className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2"
                >
                  <div
                    className={cn(
                      "flex size-12 items-center justify-center rounded-full transition",
                      active
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-primary/90 text-primary-foreground shadow-sm hover:bg-primary",
                    )}
                  >
                    <Icon className="size-6" />
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium",
                      active ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium transition",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon
                  className={cn(
                    "size-6",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
