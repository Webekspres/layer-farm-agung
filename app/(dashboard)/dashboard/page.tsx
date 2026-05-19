import { redirect } from "next/navigation";
import { getServerSession } from "@/features/auth/lib/session";

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="mx-auto flex min-h-full max-w-3xl flex-col gap-4 p-8">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
      <p className="text-muted-foreground">
        Selamat datang, {session.user.fullName ?? session.user.name}.
      </p>
      <dl className="grid gap-2 rounded-lg border border-border bg-card p-4 text-sm">
        <DetailItem label="Username" value={session.user.username} />
        <DetailItem label="Role" value={session.user.roleName} />
        <DetailItem
          label="Subdomain aktif"
          value={session.session.activeSubdomainId ?? "Global (superadmin)"}
        />
        <DetailItem
          label="Permissions"
          value={session.user.permissions?.join(", ") || "-"}
        />
      </dl>
    </main>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-2">
      <dt className="font-medium text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
