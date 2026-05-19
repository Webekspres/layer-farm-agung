"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { APIError } from "better-auth/api";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export type SignInState = {
  error?: string;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof APIError) {
    return (
      (error.body as { message?: string } | undefined)?.message ??
      "Username/email atau password salah."
    );
  }
  return "Username/email atau password salah.";
}

export async function signInWithIdentifier(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const identifier = String(formData.get("identifier") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!identifier || !password) {
    return { error: "Username/email dan password wajib diisi." };
  }

  const requestHeaders = await headers();

  try {
    if (identifier.includes("@")) {
      const user = await prisma.user.findFirst({
        where: {
          email: { equals: identifier, mode: "insensitive" },
        },
        select: { email: true },
      });

      if (!user?.email) {
        return { error: "Username/email atau password salah." };
      }

      await auth.api.signInEmail({
        body: {
          email: user.email,
          password,
          rememberMe: true,
        },
        headers: requestHeaders,
      });
    } else {
      await auth.api.signInUsername({
        body: {
          username: identifier,
          password,
          rememberMe: true,
        },
        headers: requestHeaders,
      });
    }
  } catch (error) {
    return { error: getErrorMessage(error) };
  }

  redirect("/dashboard");
}
