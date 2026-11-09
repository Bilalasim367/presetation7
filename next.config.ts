import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  outputFileTracingRoot: path.resolve(process.cwd()),
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
