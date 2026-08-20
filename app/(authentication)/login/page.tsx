import { redirect } from "next/navigation";

import { getServerSession } from "@/features/auth/lib/session";
import LoginSplitScreen from "@/features/auth/components/login-split-screen";

export default async function LoginPage() {
  const session = await getServerSession();

  // User yang sudah punya session VALID langsung diarahkan ke dashboard.
  // (Validasi di sini — bukan di proxy — karena proxy hanya melihat keberadaan
  // cookie, dan cookie basi bisa memicu redirect loop.)
  if (session) {
    redirect("/dashboard");
  }

  return <LoginSplitScreen />;
}
