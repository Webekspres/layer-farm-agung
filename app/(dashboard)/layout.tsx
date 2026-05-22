import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageContent } from "@/components/layout/page-content";
import { getServerSession } from "@/features/auth/lib/session";
import { listActiveSubdomainsForSwitcher } from "@/features/subdomains/services/list-subdomains";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const isGlobalAdmin = session.user.subdomainId === null;

  const branches = isGlobalAdmin
    ? await listActiveSubdomainsForSwitcher()
    : [];

  const activeBranchName = isGlobalAdmin
    ? null
    : (
        await prisma.subdomain.findUnique({
          where: { id: session.user.subdomainId! },
          select: { name: true },
        })
      )?.name ?? null;

  return (
    <DashboardShell
      session={session}
      branches={branches}
      activeBranchName={activeBranchName}
    >
      <PageContent>{children}</PageContent>
    </DashboardShell>
  );
}
