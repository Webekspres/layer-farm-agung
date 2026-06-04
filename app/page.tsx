import { redirect } from "next/navigation";
import { getPostLoginPath } from "@/features/auth/lib/post-login-path";
import { getServerSession } from "@/features/auth/lib/session";

export default async function HomePage() {
  const session = await getServerSession();
  redirect(
    session ? getPostLoginPath(session.user.roleName) : "/login",
  );
}