import { NextRequest, NextResponse } from "next/server";
import { mobileStaffSignIn } from "@/features/auth/services/mobile-staff-sign-in";
import { applyCorsHeaders } from "@/lib/api/cors";

function forwardSetCookieHeaders(source: Headers, target: NextResponse) {
  const getSetCookie = (
    source as Headers & { getSetCookie?: () => string[] }
  ).getSetCookie;

  if (typeof getSetCookie === "function") {
    for (const cookie of getSetCookie.call(source)) {
      target.headers.append("Set-Cookie", cookie);
    }
    return;
  }

  const single = source.get("set-cookie");
  if (single) {
    target.headers.set("Set-Cookie", single);
  }
}

export async function POST(request: NextRequest) {
  let body: { username?: string; password?: string };
  try {
    body = (await request.json()) as { username?: string; password?: string };
  } catch {
    const response = NextResponse.json(
      {
        success: false,
        error: "Data login tidak valid.",
      },
      { status: 400 },
    );
    return applyCorsHeaders(request, response);
  }

  const result = await mobileStaffSignIn({
    username: String(body.username ?? ""),
    password: String(body.password ?? ""),
    headers: request.headers,
  });

  if (!result.ok) {
    const response = NextResponse.json(
      {
        success: false,
        error: result.error,
        fieldErrors: result.fieldErrors,
      },
      { status: result.status },
    );
    return applyCorsHeaders(request, response);
  }

  const sessionPayload = await result.authResponse.json();
  const response = NextResponse.json(
    {
      success: true,
      message: "Berhasil masuk.",
      data: sessionPayload,
    },
    { status: 200 },
  );

  forwardSetCookieHeaders(result.authResponse.headers, response);

  return applyCorsHeaders(request, response);
}
