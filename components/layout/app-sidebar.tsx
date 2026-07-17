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
  isNavItemActive,
  masterDataNavItems,
  primaryNavGroups,
  type NavItem,
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

function NavGroupSection({
  label,
  items,
  pathname,
}: {
  label: string;
  items: NavItem[];
  pathname: string;
}) {
  if (items.length === 0) return null;

  const siblingHrefs = items.map((item) => item.href);

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="mb-1">{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-1.5">
          {items.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={isNavItemActive(pathname, item.href, siblingHrefs)}
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
  );
}

export function AppSidebar({ session, tenantBranding = null }: AppSidebarProps) {
  const pathname = usePathname();
  const permissions = session.user.permissions;
  const isGlobalAdmin = session.user.tenantId === null;

  const groups = primaryNavGroups
    .map((group) => ({
      ...group,
      items: filterNavByPermissions(group.items, permissions, isGlobalAdmin),
    }))
    .filter((group) => group.items.length > 0);

  const masterItems = filterNavByPermissions(
    masterDataNavItems,
    permissions,
    isGlobalAdmin,
  );
  const adminItems = filterNavByPermissions(
    adminNavItems,
    permissions,
    isGlobalAdmin,
  );

  const activeTenant =
    session.session.activeTenantId ?? session.user.tenantId;

  const brandLogo = tenantBranding?.logo_url || "/assets/logos/aapm-default.png";
  const brandTitle = tenantBranding?.brand_name || tenantBranding?.name || "AAPM";
  const brandSubtitle = tenantBranding ? "Layer Farm Partner" : "Management System";

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
                <div className="mr-2 flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
                  <Image
                    src={brandLogo}
                    alt={brandTitle}
                    width={32}
                    height={32}
                    className="size-8 rounded-lg object-contain"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="max-w-[150px] truncate font-heading font-semibold">
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
        {groups.map((group, index) => (
          <div key={group.label}>
            {index > 0 ? <SidebarSeparator className="mb-3" /> : null}
            <NavGroupSection
              label={group.label}
              items={group.items}
              pathname={pathname}
            />
          </div>
        ))}

        {masterItems.length > 0 ? (
          <>
            <SidebarSeparator />
            <NavGroupSection
              label="Data master"
              items={masterItems}
              pathname={pathname}
            />
          </>
        ) : null}

        {adminItems.length > 0 ? (
          <>
            <SidebarSeparator />
            <NavGroupSection
              label="Administrasi"
              items={adminItems}
              pathname={pathname}
            />
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
