import { createAuthClient } from "better-auth/react";
import {
  customSessionClient,
  usernameClient,
} from "better-auth/client/plugins";
import type { Auth } from "@/features/auth/server/auth";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [usernameClient(), customSessionClient<Auth>()],
});

export const { signIn, signOut, useSession } = authClient;
