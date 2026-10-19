import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  // Tailwind v4 runs through PostCSS (see postcss.config.mjs) rather than a
  // Turbopack rule. The previous `turbopack.rules` entry matched `*.css`,
  // which also captures `*.module.css`; with `as: "*.css"` it forced
  // Turbopack to treat those as global CSS, bypassing the CSS Modules
  // loader — so every `styles.x` import resolved to undefined and the
  // rules landed unhashed in the global sheet where they collided.
};

export default nextConfig;
