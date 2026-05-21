import { redirect } from "next/navigation";
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

  const branches =
    session.user.subdomainId === null
      ? await listActiveSubdomainsForSwitcher()
      : [];

  return (
    <DashboardShell session={session} branches={branches}>
      <PageContent>{children}</PageContent>
    </DashboardShell>
  );
}
