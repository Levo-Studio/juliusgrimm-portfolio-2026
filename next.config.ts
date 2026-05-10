import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: "node_modules/.cache/next",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**"
      }
    ]
  }
};

export default nextConfig;
