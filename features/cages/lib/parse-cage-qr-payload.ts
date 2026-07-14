import { isUuid } from "@/lib/uuid";

const DEEP_LINK_PATTERN =
  /^(?:aapmmobile|aapm):\/\/kandang\/([^/]+)\/produksi\/?$/i;

/** Extract cage identifier (qr_code or UUID) from scanned QR text. */
export function parseCageQrPayload(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const deepLinkMatch = trimmed.match(DEEP_LINK_PATTERN);
  if (deepLinkMatch?.[1]) {
    return deepLinkMatch[1];
  }

  if (isUuid(trimmed) || /^KDG[0-9A-F]+$/i.test(trimmed)) {
    return trimmed;
  }

  return null;
}
