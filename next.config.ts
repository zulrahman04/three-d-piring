import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    "neighbors-folding-adjustments-stickers.trycloudflare.com",
    "*.trycloudflare.com",
    "**.trycloudflare.com",
    "*.ngrok-free.app",
    "**.ngrok-free.app",
    "*.loca.lt",
  ],
  experimental: {
    agentFeedback: true,
    agentUpgrade: "security",
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
