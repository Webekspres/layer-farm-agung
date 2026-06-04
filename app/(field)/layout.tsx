import { redirect } from "next/navigation";
import { FieldShell } from "@/components/layout/field-shell";
import { getServerSession } from "@/features/auth/lib/session";
import { requirePermission } from "@/features/auth/lib/require-permission";

export default async function FieldLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  await requirePermission("manage_production", { redirectTo: "/login" });

  return <FieldShell>{children}</FieldShell>;
}
