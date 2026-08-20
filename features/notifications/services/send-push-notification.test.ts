import { describe, expect, test } from "bun:test";

import { parseExpoPushResponse } from "./send-push-notification";

const DEVICES = [
  { id: "dev-1", token: "ExponentPushToken[aaa]" },
  { id: "dev-2", token: "ExponentPushToken[bbb]" },
  { id: "dev-3", token: "ExponentPushToken[ccc]" },
];

describe("parseExpoPushResponse", () => {
  test("menghitung sent/failed berdasarkan status Expo", () => {
    const result = parseExpoPushResponse(DEVICES, {
      data: [{ status: "ok" }, { status: "error" }, { status: "ok" }],
    });

    expect(result.sent).toBe(2);
    expect(result.failed).toBe(1);
    expect(result.invalidTokenIds).toEqual([]);
  });

  test("token DeviceNotRegistered ditandai untuk dihapus", () => {
    const result = parseExpoPushResponse(DEVICES, {
      data: [
        { status: "error", message: "ExpoPushErrorReceipt[500]: DeviceNotRegistered" },
        { status: "ok" },
      ],
    });

    expect(result.failed).toBe(1);
    expect(result.invalidTokenIds).toEqual(["dev-1"]);
  });

  test("response tanpa data dianggap gagal semua tapi tanpa token invalid", () => {
    const result = parseExpoPushResponse(DEVICES, {});

    expect(result.sent).toBe(0);
    expect(result.failed).toBe(0);
    expect(result.invalidTokenIds).toEqual([]);
  });

  test("index di luar array devices diabaikan (tidak crash)", () => {
    const result = parseExpoPushResponse(DEVICES, {
      data: [
        { status: "error", message: "DeviceNotRegistered" },
        { status: "error", message: "DeviceNotRegistered" },
        { status: "error", message: "DeviceNotRegistered" },
        { status: "error", message: "DeviceNotRegistered" },
      ],
    });

    expect(result.failed).toBe(4);
    expect(result.invalidTokenIds).toEqual(["dev-1", "dev-2", "dev-3"]);
  });
});