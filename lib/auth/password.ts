import { hashPassword } from "better-auth/crypto";
import bcrypt from "bcryptjs";

/** Hash for Better Auth `account.password` (used at sign-in). */
export async function hashCredentialPassword(password: string) {
  return hashPassword(password);
}

/** Hash for domain `User.password_hash` (bcrypt per ERD). */
export async function hashUserPassword(password: string) {
  return bcrypt.hash(password, 12);
}

/** Create both hashes when provisioning users via admin. */
export async function hashPasswordsForUser(password: string) {
  const [credentialHash, passwordHash] = await Promise.all([
    hashCredentialPassword(password),
    hashUserPassword(password),
  ]);
  return { credentialHash, passwordHash };
}
