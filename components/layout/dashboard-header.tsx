"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  adminNavItems,
  mainNavItems,
} from "@/features/dashboard/config/navigation";
import { Building2, LogOut, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Fragment, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { TenantSwitcher } from "@/components/layout/tenant-switcher";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import { authClient } from "@/features/auth/client/auth-client";
import { notifyActionResult } from "@/components/shared/action-feedback";
import { switchActiveTenantAction } from "@/features/tenants/actions/switch-active-tenant";
import type { ServerSession } from "@/features/auth/lib/session";

type TenantOption = { id: string; name: string };

type DashboardHeaderProps = {
  session: ServerSession;
  title?: string;
  tenants?: TenantOption[];
  activeTenantId?: string | null;
  activeTenantName?: string | null;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const breadcrumbMapping: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/locations": "Lokasi",
  "/dashboard/cages": "Kandang",
  "/dashboard/strains": "Strain",
  "/dashboard/egg-grades": "Grade Telur",
  "/dashboard/vendors": "Vendor",
  "/dashboard/tenants": "Tenant",
  "/dashboard/users": "Pengguna",
  "/dashboard/roles": "Peran & Akses",
  "/dashboard/profile": "Profil",
  "/dashboard/production": "Produksi",
  "/dashboard/inventory": "Inventori",
  "/dashboard/finance": "Keuangan",
};

type BreadcrumbCrumb = {
  title: string;
  href?: string;
  isLast: boolean;
};

function getBreadcrumbs(pathname: string): BreadcrumbCrumb[] {
  const cleanPath = pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname;

  if (cleanPath === "/dashboard") {
    return [{ title: "Dashboard", isLast: true }];
  }

  const segments = cleanPath.split("/").filter(Boolean);
  const crumbs: BreadcrumbCrumb[] = [];

  let currentPath = "";
  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`;
    const isLast = i === segments.length - 1;

    let title = breadcrumbMapping[currentPath];
    if (!title) {
      if (segments[i - 1] === "cages") {
        title = "Detail";
      } else {
        title = segments[i].charAt(0).toUpperCase() + segments[i].slice(1);
      }
    }

    crumbs.push({
      title,
      href: isLast ? undefined : currentPath,
      isLast,
    });
  }

  return crumbs;
}

export function DashboardHeader({
  session,
  title,
  tenants = [],
  activeTenantId = null,
  activeTenantName = null,
}: DashboardHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSwitching, startSwitching] = useTransition();
  const displayName = session.user.fullName ?? session.user.name ?? "User";

  const crumbs = getBreadcrumbs(pathname);
  if (title && crumbs.length > 0) {
    crumbs[crumbs.length - 1].title = title;
  }

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  function handleTenantSwitch(next: string) {
    const tenantId = next === "global" ? null : next;
    startSwitching(async () => {
      const result = await switchActiveTenantAction(tenantId);
      if (
        notifyActionResult(result, {
          success: tenantId
            ? "Tenant aktif diperbarui."
            : "Konteks global (semua tenant) aktif.",
        })
      ) {
        router.refresh();
      }
    });
  }

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 px-3 backdrop-blur supports-backdrop-filter:bg-background/80 sm:px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 hidden h-4 sm:block" />
      <Breadcrumb className="min-w-0 flex-1">
        <BreadcrumbList>
          {crumbs.map((crumb, index) => {
            const key = `${crumb.title}-${index}`;
            return (
              <Fragment key={key}>
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {crumb.isLast ? (
                    <BreadcrumbPage className="truncate font-heading font-semibold text-foreground">
                      {crumb.title}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link
                        href={crumb.href!}
                        className="truncate text-muted-foreground transition-colors hover:text-foreground font-medium"
                      >
                        {crumb.title}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
        {tenants.length > 0 ? (
          <TenantSwitcher
            tenants={tenants}
            activeTenantId={activeTenantId}
          />
        ) : activeTenantName ? (
          <Badge
            variant="secondary"
            className="hidden font-normal md:inline-flex"
          >
            <Building2 className="size-3.5 shrink-0" />
            {activeTenantName}
          </Badge>
        ) : null}
        <ThemeSwitcher />
        <Separator orientation="vertical" className="hidden h-4 sm:block" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <Avatar size="sm">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-40 truncate text-sm font-medium sm:inline">
                {displayName}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-1.5">
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-xs text-muted-foreground">
                  @{session.user.username}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {session.user.roleName}
                </p>
              </div>
            </DropdownMenuLabel>

            {/* Mobile-only tenant switcher — hidden on md+ where the header switcher is visible */}
            {tenants.length > 0 && (
              <>
                <DropdownMenuSeparator className="md:hidden" />
                <DropdownMenuLabel className="text-xs flex items-center text-muted-foreground font-normal md:hidden">
                  <Building2 className="mr-1.5 inline size-3.5" />
                  Tenant Switcher
                </DropdownMenuLabel>
                {/* Scrollable zone — caps at ~5 items so Profile & Keluar stay pinned */}
                <div className="md:hidden max-h-[180px] overflow-y-auto">
                  <DropdownMenuRadioGroup
                    value={activeTenantId ?? "global"}
                    onValueChange={handleTenantSwitch}
                  >
                    <DropdownMenuRadioItem
                      value="global"
                      disabled={isSwitching}
                    >
                      Global (Semua Tenant)
                    </DropdownMenuRadioItem>
                    {tenants.map((tenant) => (
                      <DropdownMenuRadioItem
                        key={tenant.id}
                        value={tenant.id}
                        disabled={isSwitching}
                        className="truncate"
                      >
                        {tenant.name}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </div>
              </>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">
                <User />
                Profil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
              <LogOut />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
