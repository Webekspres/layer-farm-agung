"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  adminNavItems,
  filterNavByPermissions,
  mainNavItems,
  masterDataNavItems,
} from "@/features/dashboard/config/navigation";
import type { ServerSession } from "@/features/auth/lib/session";

type TenantBranding = {
  name: string;
  brand_name: string | null;
  logo_url: string | null;
};

type AppSidebarProps = {
  session: ServerSession;
  tenantBranding?: TenantBranding | null;
};

export function AppSidebar({ session, tenantBranding = null }: AppSidebarProps) {
  const pathname = usePathname();
  const permissions = session.user.permissions;
  const isGlobalAdmin = session.user.tenantId === null;

  const mainItems = filterNavByPermissions(mainNavItems, permissions, isGlobalAdmin);
  const masterItems = filterNavByPermissions(
    masterDataNavItems,
    permissions,
    isGlobalAdmin,
  );
  const adminItems = filterNavByPermissions(adminNavItems, permissions, isGlobalAdmin);

  const activeTenant =
    session.session.activeTenantId ?? session.user.tenantId;

  // Resolve white-labeled branding parameters safely
  const brandLogo = tenantBranding?.logo_url || "/assets/logos/aapm-default.png";
  const brandTitle = tenantBranding?.brand_name || tenantBranding?.name || "Layer Farm";
  const brandSubtitle = tenantBranding ? "Layer Farm Partner" : "Agung Petelur";

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="hover:bg-transparent active:bg-transparent"
              asChild
            >
              <Link href="/dashboard">
                <div className="flex aspect-square mr-2 size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
                  <Image
                    src={brandLogo}
                    alt={brandTitle}
                    width={32}
                    height={32}
                    className="size-8 rounded-lg object-contain"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold font-heading max-w-[150px]">
                    {brandTitle}
                  </span>
                  <span className="truncate text-xs text-sidebar-foreground/70">
                    {brandSubtitle}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-3">
        <SidebarGroup>
          <SidebarGroupLabel className="mb-1">Menu utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      pathname === item.href ||
                      (item.href !== "/dashboard" &&
                        pathname.startsWith(item.href))
                    }
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.badge ? (
                    <SidebarMenuBadge className="bg-sidebar-accent text-sidebar-accent-foreground">
                      {item.badge}
                    </SidebarMenuBadge>
                  ) : null}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {masterItems.length > 0 ? (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel className="mb-1">Data master</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1.5">
                  {masterItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith(item.href)}
                        tooltip={item.title}
                      >
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        ) : null}

        {adminItems.length > 0 ? (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel className="mb-1">Administrasi</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1.5">
                  {adminItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith(item.href)}
                        tooltip={item.title}
                      >
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                      {item.badge ? (
                        <SidebarMenuBadge className="bg-sidebar-accent text-sidebar-accent-foreground">
                          {item.badge}
                        </SidebarMenuBadge>
                      ) : null}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        ) : null}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="px-2 py-2 text-xs text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
          <p className="truncate font-medium text-sidebar-foreground capitalize">
            {session.user.roleName}
          </p>
          <p className="truncate">
            {activeTenant ? "Tenant aktif" : "Akses global"}
          </p>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
