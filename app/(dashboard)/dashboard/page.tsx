import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";
import { getServerSession } from "@/features/auth/lib/session";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return <DashboardOverview session={session} />;
}
