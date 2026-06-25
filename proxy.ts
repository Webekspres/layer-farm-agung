import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import {
  applyCorsHeaders,
  corsPreflightResponse,
  isMobileCorsPath,
} from "@/lib/api/cors";

const AUTH_ROUTES = ["/login"];
const PUBLIC_ROUTES = ["/login", "/api/auth", "/api-docs"];

function isPublicPath(pathname: string) {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function isAuthPage(pathname: string) {
  return AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isMobileCorsPath(pathname)) {
    if (request.method === "OPTIONS") {
      return corsPreflightResponse(request);
    }

    return applyCorsHeaders(request, NextResponse.next());
  }

  if (isPublicPath(pathname) && !isAuthPage(pathname)) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie && !isAuthPage(pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (sessionCookie && isAuthPage(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
