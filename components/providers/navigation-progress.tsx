"use client";

import NextTopLoader from "nextjs-toploader";

/**
 * Route transition progress bar (NProgress-style).
 * Uses theme primary green from globals.css.
 */
export function NavigationProgress() {
  return (
    <NextTopLoader
      color="oklch(0.527 0.154 150.069)"
      height={3}
      showSpinner={false}
      easing="ease"
      speed={200}
      crawl
      shadow="0 0 8px oklch(0.527 0.154 150.069 / 0.45)"
    />
  );
}
