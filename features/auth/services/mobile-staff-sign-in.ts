import { APIError } from "better-auth/api";
import { findUserBySignInIdentifier } from "@/features/auth/lib/resolve-user-identifier";
import { auth } from "@/features/auth/server/auth";
import { STAFF_ROLE_NAME } from "@/features/roles/config/system-roles";

export const MOBILE_STAFF_ONLY_MESSAGE =
  "Hanya bisa login dengan akun staff kandang.";

export type MobileSignInField = "username" | "password";

export type MobileSignInFailure = {
  ok: false;
  error: string;
  fieldErrors?: Partial<Record<MobileSignInField, string>>;
  status: number;
};

export type MobileSignInSuccess = {
  ok: true;
  authResponse: Response;
};

export type MobileSignInResult = MobileSignInFailure | MobileSignInSuccess;

function failure(
  error: string,
  status: number,
  fieldErrors?: Partial<Record<MobileSignInField, string>>,
): MobileSignInFailure {
  return { ok: false, error, status, fieldErrors };
}

export async function mobileStaffSignIn(input: {
  username: string;
  password: string;
  headers: Headers;
}): Promise<MobileSignInResult> {
  const identifier = input.username.trim();
  const password = input.password;

  if (!identifier) {
    return failure("Username wajib diisi.", 400, {
      username: "Username wajib diisi.",
    });
  }

  if (!password) {
    return failure("Password wajib diisi.", 400, {
      password: "Password wajib diisi.",
    });
  }

  const user = await findUserBySignInIdentifier(identifier);
  if (!user) {
    return failure("Username tidak ditemukan.", 400, {
      username: "Username tidak ditemukan.",
    });
  }

  try {
    const authResponse = await auth.api.signInUsername({
      body: {
        username: user.username,
        password,
        rememberMe: true,
      },
      headers: input.headers,
      asResponse: true,
    });

    if (!authResponse.ok) {
      return failure("Password salah.", 400, { password: "Password salah." });
    }

    if (user.role.name !== STAFF_ROLE_NAME) {
      await auth.api.signOut({
        headers: authResponse.headers,
        asResponse: true,
      });
      return failure(MOBILE_STAFF_ONLY_MESSAGE, 403);
    }

    return { ok: true, authResponse };
  } catch (error) {
    if (error instanceof APIError) {
      const message =
        (error.body as { message?: string } | undefined)?.message?.trim() ??
        "Password salah.";

      if (error.status === "FORBIDDEN") {
        return failure(message, 403);
      }

      return failure("Password salah.", 400, { password: "Password salah." });
    }

    return failure("Password salah.", 400, { password: "Password salah." });
  }
}
