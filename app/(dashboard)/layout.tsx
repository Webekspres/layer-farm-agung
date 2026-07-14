import type { Metadata } from "next";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageContent } from "@/components/layout/page-content";
import { getServerSession } from "@/features/auth/lib/session";
import { listActiveTenantsForSwitcher } from "@/features/tenants/services/list-tenants";

export async function generateMetadata(): Promise<Metadata> {
  const session = await getServerSession();
  if (!session || session.user.tenantId === null) {
    return {
      title: {
        default: "AAPM Platform",
        template: "%s | AAPM Platform",
      },
    };
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.user.tenantId },
    select: { name: true, brand_name: true },
  });

  const brandName = tenant?.brand_name || tenant?.name || "AAPM Platform";
  return {
    title: {
      default: `${brandName} - Management System`,
      template: `%s | ${brandName}`,
    },
  };
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const isGlobalAdmin = session.user.tenantId === null;

  const tenants = isGlobalAdmin ? await listActiveTenantsForSwitcher() : [];

  const tenantBranding = !isGlobalAdmin && session.user.tenantId
    ? await prisma.tenant.findUnique({
        where: { id: session.user.tenantId },
        select: {
          name: true,
          brand_name: true,
          logo_url: true,
        },
      })
    : null;

  const activeTenantName = isGlobalAdmin
    ? null
    : tenantBranding?.name ?? null;

  return (
    <DashboardShell
      session={session}
      tenants={tenants}
      activeTenantName={activeTenantName}
      tenantBranding={tenantBranding}
    >
      <PageContent>{children}</PageContent>
    </DashboardShell>
  );
}
