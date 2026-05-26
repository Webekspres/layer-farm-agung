import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageContent } from "@/components/layout/page-content";
import { getServerSession } from "@/features/auth/lib/session";
import { listActiveTenantsForSwitcher } from "@/features/tenants/services/list-tenants";

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

  const activeTenantName = isGlobalAdmin
    ? null
    : (
        await prisma.tenant.findUnique({
          where: { id: session.user.tenantId! },
          select: { name: true },
        })
      )?.name ?? null;

  return (
    <DashboardShell
      session={session}
      tenants={tenants}
      activeTenantName={activeTenantName}
    >
      <PageContent>{children}</PageContent>
    </DashboardShell>
  );
}
