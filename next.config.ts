import type { NextConfig } from "next";

// `standalone` is for Docker/self-host (see Dockerfile). Skip on Vercel.
const nextConfig: NextConfig = {
  ...(!process.env.VERCEL ? { output: "standalone" as const } : {}),
};

export default nextConfig;
