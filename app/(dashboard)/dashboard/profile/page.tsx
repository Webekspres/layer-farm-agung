import { PageHeader } from "@/components/layout/page-header";
import { ProfilePanel } from "@/features/profile/components/profile-panel";
import { getServerSession } from "@/features/auth/lib/session";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <>
      <PageHeader
        title="Profil"
        description="Informasi akun dan pengaturan password Anda."
      />
      <ProfilePanel session={session} />
    </>
  );
}
