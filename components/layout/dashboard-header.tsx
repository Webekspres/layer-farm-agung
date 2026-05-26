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
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { TenantSwitcher } from "@/components/layout/tenant-switcher";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import { authClient } from "@/features/auth/client/auth-client";
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

const allNavItems = [
  ...mainNavItems,
  ...adminNavItems,
  { title: "Profil", href: "/dashboard/profile" },
  { title: "Tenant", href: "/dashboard/tenants" },
];

function resolvePageTitle(pathname: string, fallback = "Dashboard") {
  const match = allNavItems.find(
    (item) =>
      pathname === item.href ||
      (item.href !== "/dashboard" && pathname.startsWith(item.href)),
  );
  return match?.title ?? fallback;
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
  const pageTitle = title ?? resolvePageTitle(pathname);
  const displayName = session.user.fullName ?? session.user.name ?? "User";

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 px-3 backdrop-blur supports-backdrop-filter:bg-background/80 sm:px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 hidden h-4 sm:block" />
      <Breadcrumb className="min-w-0 flex-1">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="truncate font-heading">
              {pageTitle}
            </BreadcrumbPage>
          </BreadcrumbItem>
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
