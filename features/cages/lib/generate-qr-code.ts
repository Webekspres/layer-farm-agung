import { randomBytes } from "crypto";

/** Human-readable unique token for cage QR (e.g. KDG4F8A2B1C0). */
export function generateCageQrCode(): string {
  const segment = randomBytes(6).toString("hex").toUpperCase();
  return `KDG${segment}`;
}
