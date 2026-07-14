import { describe, expect, test } from "bun:test";
import { apiError, apiSuccess } from "@/lib/api/response";

describe("apiSuccess", () => {
  test("returns standardized success envelope", async () => {
    const response = apiSuccess({ id: 1 }, "OK");
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      success: true,
      message: "OK",
      data: { id: 1 },
    });
  });
});

describe("apiError", () => {
  test("returns standardized error envelope", async () => {
    const response = apiError("Unauthorized", 401);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({
      success: false,
      error: "Unauthorized",
    });
  });
});
