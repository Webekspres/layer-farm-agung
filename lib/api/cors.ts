import { NextRequest, NextResponse } from "next/server";

export const API_V1_PREFIX = "/api/v1";

const DEV_DEFAULT_ORIGINS = [
  "http://localhost:8081",
  "http://127.0.0.1:8081",
];

const LAN_ORIGIN_PATTERN = /^https?:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d+$/;

export function isApiV1Path(pathname: string) {
  return (
    pathname === API_V1_PREFIX || pathname.startsWith(`${API_V1_PREFIX}/`)
  );
}

export function isAuthApiPath(pathname: string) {
  return pathname === "/api/auth" || pathname.startsWith("/api/auth/");
}

export function isMobileCorsPath(pathname: string) {
  return isApiV1Path(pathname) || isAuthApiPath(pathname);
}

function configuredOrigins(): string[] {
  const raw = process.env.MOBILE_CORS_ORIGINS?.trim();
  if (!raw) return [];

  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function resolveAllowedOrigin(request: NextRequest): string | null {
  const origin = request.headers.get("origin");
  if (!origin) return null;

  const allowed = configuredOrigins();

  if (allowed.includes("*")) return origin;
  if (allowed.includes(origin)) return origin;

  if (process.env.NODE_ENV === "development") {
    if (DEV_DEFAULT_ORIGINS.includes(origin)) return origin;
    if (LAN_ORIGIN_PATTERN.test(origin)) return origin;
  }

  return null;
}

export function applyCorsHeaders(
  request: NextRequest,
  response: NextResponse,
): NextResponse {
  const origin = resolveAllowedOrigin(request);

  if (origin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Vary", "Origin");
  }

  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Cookie, expo-origin",
  );

  return response;
}

export function corsPreflightResponse(request: NextRequest): NextResponse {
  const response = new NextResponse(null, { status: 204 });
  return applyCorsHeaders(request, response);
}
