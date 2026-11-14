import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.STUDENT_API_URL ?? "http://localhost:4001",
  },
  async redirects() {
    return [
      {
        source: "/learn",
        destination: "/dashboard/overview",
        permanent: false,
      },
      {
        source: "/learn/:path*",
        destination: "/dashboard/:path*",
        permanent: false,
      },
    ];
  },
  transpilePackages: [
    "@acadly/assets",
    "@acadly/infrastructure",
    "@acadly/modules",
  ],
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    root: path.resolve(__dirname, "../.."),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
