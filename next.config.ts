import type { NextConfig } from "next";

// No images.remotePatterns: every next/image source is a local file (or a data: URL, which
// is never optimised), so /_next/image must not fetch and re-serve images from other hosts.
const nextConfig: NextConfig = {};

export default nextConfig;
