import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["156.67.24.44", "127.0.0.1", "localhost"],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
