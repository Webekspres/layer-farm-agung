/** Deep link encoded in printed cage QR — matches `aapm-mobile` app.json scheme. */
export const MOBILE_CAGE_QR_SCHEME = "aapmmobile";

export function buildCageQrUrl(qrCode: string): string {
  return `${MOBILE_CAGE_QR_SCHEME}://kandang/${qrCode}/produksi`;
}
