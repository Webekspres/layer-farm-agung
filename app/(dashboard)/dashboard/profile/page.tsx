import { PageHeader } from "@/components/layout/page-header";
import { ProfilePanel } from "@/features/profile/components/profile-panel";
import { getServerSession } from "@/features/auth/lib/session";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const isGlobalAdmin = session.user.tenantId === null;

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

  return (
    <>
      <PageHeader
        title="Profil"
        description="Informasi akun dan pengaturan password Anda."
      />
      <ProfilePanel session={session} tenantBranding={tenantBranding} />
    </>
  );
}
