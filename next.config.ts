import type { NextConfig } from "next";
import { withSerwist } from "@serwist/turbopack";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
};

// Bungkus konfigurasi Next.js Anda menggunakan helper dari @serwist/turbopack
export default withSerwist({
  // Tentukan konfigurasi Next.js murni di sini
  ...nextConfig,
});