import { NextRequest } from "next/server";
import { z } from "zod";
import { requireApiSession } from "@/lib/api/require-api-session";
import { apiSuccess, apiValidationError } from "@/lib/api/response";
import { registerPushToken, unregisterPushToken } from "@/features/notifications/services/register-push-token";

const registerPushTokenSchema = z.object({
  token: z.string().min(10),
  platform: z.enum(["android", "ios"]).optional(),
});

const unregisterPushTokenSchema = z.object({
  token: z.string().min(10),
});

export async function POST(request: NextRequest) {
  const auth = await requireApiSession();

  if (auth.error) {
    return auth.error;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiValidationError("Body JSON tidak valid.");
  }

  const parsed = registerPushTokenSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(
      parsed.error.issues[0]?.message ?? "Token push tidak valid.",
    );
  }

  await registerPushToken({
    userId: auth.session.user.id,
    token: parsed.data.token,
    platform: parsed.data.platform,
  });

  return apiSuccess(
    { registered: true },
    "Perangkat terdaftar untuk notifikasi.",
  );
}

export async function DELETE(request: NextRequest) {
  const auth = await requireApiSession();

  if (auth.error) {
    return auth.error;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiValidationError("Body JSON tidak valid.");
  }

  const parsed = unregisterPushTokenSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(
      parsed.error.issues[0]?.message ?? "Token push tidak valid.",
    );
  }

  await unregisterPushToken(auth.session.user.id, parsed.data.token);

  return apiSuccess(
    { unregistered: true },
    "Perangkat dihapus dari notifikasi.",
  );
}