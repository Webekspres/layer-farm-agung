"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/features/auth/server/auth";

export async function signOutAction() {
  const requestHeaders = await headers();

  try {
    await auth.api.signOut({
      headers: requestHeaders,
    });
  } catch {
    // Best-effort — tetap arahkan ke login meski revoke session gagal.
  }

  redirect("/login");
}
