import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { customSession, username } from "better-auth/plugins";
import { APIError } from "better-auth/api";
import prisma from "@/lib/prisma";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  user: {
    modelName: "User",
    fields: {
      name: "full_name",
      createdAt: "created_at",
      updatedAt: "updated_at",
      emailVerified: "email_verified",
      image: "image",
    },
  },
  session: {
    modelName: "Session",
    fields: {
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
      ipAddress: "ip_address",
      userAgent: "user_agent",
      userId: "user_id",
    },
    additionalFields: {
      activeSubdomainId: {
        type: "string",
        required: false,
        input: false,
        fieldName: "active_subdomain_id",
      },
    },
  },
  account: {
    modelName: "Account",
    fields: {
      accountId: "account_id",
      providerId: "provider_id",
      userId: "user_id",
      accessToken: "access_token",
      refreshToken: "refresh_token",
      idToken: "id_token",
      accessTokenExpiresAt: "access_token_expires_at",
      refreshTokenExpiresAt: "refresh_token_expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  verification: {
    modelName: "Verification",
    fields: {
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  plugins: [
    username({
      usernameNormalization: false,
      schema: {
        user: {
          fields: {
            username: "username",
            displayUsername: "display_username",
          },
        },
      },
    }),
    customSession(async ({ user, session }) => {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          role: {
            include: {
              role_permissions: {
                include: { permission: true },
              },
            },
          },
        },
      });

      if (!dbUser) {
        throw new APIError("UNAUTHORIZED", { message: "User not found" });
      }

      const permissions = dbUser.role.role_permissions.map(
        (rp) => rp.permission.name,
      );

      const sessionRecord = session as typeof session & {
        activeSubdomainId?: string | null;
      };

      return {
        user: {
          ...user,
          fullName: dbUser.full_name,
          username: dbUser.username,
          roleId: dbUser.role_id,
          roleName: dbUser.role.name,
          subdomainId: dbUser.subdomain_id,
          permissions,
        },
        session: {
          ...session,
          activeSubdomainId:
            sessionRecord.activeSubdomainId ?? dbUser.subdomain_id,
        },
      };
    }),
    nextCookies(),
  ],
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const user = await prisma.user.findUnique({
            where: { id: session.userId },
            include: { subdomain: true },
          });

          if (!user?.is_active) {
            throw new APIError("FORBIDDEN", {
              message: "Akun tidak aktif. Hubungi administrator.",
            });
          }

          if (
            user.subdomain_id &&
            user.subdomain &&
            !user.subdomain.is_active
          ) {
            throw new APIError("FORBIDDEN", {
              message: "Cabang peternakan tidak aktif.",
            });
          }

          return {
            data: {
              ...session,
              activeSubdomainId: user.subdomain_id,
            },
          };
        },
      },
    },
  },
});

export type Auth = typeof auth;
