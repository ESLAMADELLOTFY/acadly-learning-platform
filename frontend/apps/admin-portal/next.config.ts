import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.ADMIN_API_URL ?? "http://localhost:4000",
  },
  async redirects() {
    return [
      {
        source: "/signup",
        destination:
          process.env.STUDENT_PORTAL_URL ?? "http://localhost:3001/signup",
        permanent: false,
      },
      {
        source: "/admin",
        destination: "/dashboard/overview",
        permanent: false,
      },
      {
        source: "/admin/:path*",
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
