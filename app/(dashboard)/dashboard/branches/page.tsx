import { redirect } from "next/navigation";

/** @deprecated Use /dashboard/tenants */
export default function BranchesRedirectPage() {
  redirect("/dashboard/tenants");
}
