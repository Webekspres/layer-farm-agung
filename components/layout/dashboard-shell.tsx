"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import type { ServerSession } from "@/features/auth/lib/session";

type DashboardShellProps = {
  session: ServerSession;
  children: React.ReactNode;
};

export function DashboardShell({ session, children }: DashboardShellProps) {
  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen>
        <AppSidebar session={session} />
        <SidebarInset className="min-h-svh min-w-0 overflow-x-hidden">
          <DashboardHeader session={session} />
          <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
