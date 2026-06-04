import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import {
  getPostLoginPath,
  isStaffRole,
} from "@/features/auth/lib/post-login-path";
import { auth } from "@/features/auth/server/auth";

const AUTH_ROUTES = ["/login"];
const PUBLIC_ROUTES = [
  "/login",
  "/api/auth",
  "/manifest.json",
  "/serwist",
  "/~offline",
];

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

function isDashboardPath(pathname: string) {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname) && !isAuthPage(pathname)) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie && !isAuthPage(pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (sessionCookie) {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (session?.user.roleName) {
      if (isAuthPage(pathname)) {
        return NextResponse.redirect(
          new URL(getPostLoginPath(session.user.roleName), request.url),
        );
      }

      if (isStaffRole(session.user.roleName) && isDashboardPath(pathname)) {
        return NextResponse.redirect(new URL("/kandang", request.url));
      }
    } else if (isAuthPage(pathname)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
