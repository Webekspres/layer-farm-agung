"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import type { ServerSession } from "@/features/auth/lib/session";

type TenantOption = { id: string; name: string };

type TenantBranding = {
  name: string;
  brand_name: string | null;
  logo_url: string | null;
};

type DashboardShellProps = {
  session: ServerSession;
  tenants?: TenantOption[];
  activeTenantName?: string | null;
  tenantBranding?: TenantBranding | null;
  children: React.ReactNode;
};

export function DashboardShell({
  session,
  tenants = [],
  activeTenantName = null,
  tenantBranding = null,
  children,
}: DashboardShellProps) {
  const isGlobalAdmin = session.user.tenantId === null;
  const activeTenantId =
    session.session.activeTenantId ?? session.user.tenantId;

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen>
        <AppSidebar session={session} tenantBranding={tenantBranding} />
        <SidebarInset className="h-svh min-w-0 overflow-hidden">
          <DashboardHeader
            session={session}
            tenants={isGlobalAdmin ? tenants : []}
            activeTenantId={isGlobalAdmin ? activeTenantId : null}
            activeTenantName={activeTenantName}
          />
          <div className="flex min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
