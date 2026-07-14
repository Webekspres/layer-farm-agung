import { describe, expect, test } from "bun:test";
import { NextRequest } from "next/server";
import { isApiV1Path, resolveAllowedOrigin } from "@/lib/api/cors";

describe("isApiV1Path", () => {
  test("matches v1 prefix and nested routes", () => {
    expect(isApiV1Path("/api/v1")).toBe(true);
    expect(isApiV1Path("/api/v1/cages")).toBe(true);
    expect(isApiV1Path("/api/v1/production")).toBe(true);
    expect(isApiV1Path("/api/auth")).toBe(false);
  });
});

describe("resolveAllowedOrigin", () => {
  test("allows Expo dev origin in development", () => {
    const previous = process.env.NODE_ENV;
    Reflect.set(process.env, "NODE_ENV", "development");

    const request = new NextRequest("http://localhost:3000/api/v1/cages", {
      headers: { origin: "http://localhost:8081" },
    });

    expect(resolveAllowedOrigin(request)).toBe("http://localhost:8081");

    Reflect.set(process.env, "NODE_ENV", previous);
  });
});
