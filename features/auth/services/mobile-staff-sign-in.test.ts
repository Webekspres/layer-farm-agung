import { beforeEach, describe, expect, mock, test } from "bun:test";

import {
  MOBILE_STAFF_ONLY_MESSAGE,
  mobileStaffSignIn,
} from "@/features/auth/services/mobile-staff-sign-in";

const findUserBySignInIdentifier = mock(() =>
  Promise.resolve(null as null | {
    id: string;
    username: string;
    is_active: boolean;
    role: { name: string };
  }),
);

const signInUsername = mock(() =>
  Promise.resolve(new Response(JSON.stringify({ user: { id: "1" } }), { status: 200 })),
);

const signOut = mock(() => Promise.resolve(new Response(null, { status: 200 })));

mock.module("@/features/auth/lib/resolve-user-identifier", () => ({
  findUserBySignInIdentifier,
}));

mock.module("@/features/auth/server/auth", () => ({
  auth: {
    api: {
      signInUsername,
      signOut,
    },
  },
}));

describe("mobileStaffSignIn", () => {
  beforeEach(() => {
    findUserBySignInIdentifier.mockReset();
    signInUsername.mockReset();
    signOut.mockReset();
  });

  test("returns username field error when identifier unknown", async () => {
    findUserBySignInIdentifier.mockResolvedValue(null);

    const result = await mobileStaffSignIn({
      username: "ghost",
      password: "password123",
      headers: new Headers(),
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.fieldErrors?.username).toBe("Username tidak ditemukan.");
    expect(signInUsername).not.toHaveBeenCalled();
  });

  test("returns password field error when credentials invalid", async () => {
    findUserBySignInIdentifier.mockResolvedValue({
      id: "u1",
      username: "staff.kandang",
      is_active: true,
      role: { name: "staff" },
    });
    signInUsername.mockResolvedValue(
      new Response(JSON.stringify({ message: "Invalid" }), { status: 401 }),
    );

    const result = await mobileStaffSignIn({
      username: "staff.kandang",
      password: "wrong",
      headers: new Headers(),
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.fieldErrors?.password).toBe("Password salah.");
  });

  test("rejects non-staff after successful auth", async () => {
    findUserBySignInIdentifier.mockResolvedValue({
      id: "u2",
      username: "admin",
      is_active: true,
      role: { name: "admin" },
    });
    signInUsername.mockResolvedValue(
      new Response(JSON.stringify({ user: { id: "u2" } }), { status: 200 }),
    );

    const result = await mobileStaffSignIn({
      username: "admin",
      password: "password123",
      headers: new Headers(),
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe(MOBILE_STAFF_ONLY_MESSAGE);
    expect(signOut).toHaveBeenCalled();
  });

  test("allows staff sign-in", async () => {
    findUserBySignInIdentifier.mockResolvedValue({
      id: "u3",
      username: "staff.kandang",
      is_active: true,
      role: { name: "staff" },
    });
    signInUsername.mockResolvedValue(
      new Response(JSON.stringify({ user: { id: "u3" } }), { status: 200 }),
    );

    const result = await mobileStaffSignIn({
      username: "staff.kandang",
      password: "password123",
      headers: new Headers(),
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.authResponse.status).toBe(200);
    expect(signOut).not.toHaveBeenCalled();
  });
});
