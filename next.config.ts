import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Enable static export for iOS build
  output: process.env.NEXT_OUTPUT === 'export' ? 'export' : undefined,
  distDir: process.env.NEXT_OUTPUT === 'export' ? 'out' : '.next',
  trailingSlash: true,
  images: {
    unoptimized: process.env.NEXT_OUTPUT === 'export'
  }
};

export default nextConfig;
