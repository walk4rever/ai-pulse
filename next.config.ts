import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: process.cwd(),
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/wiki/:path*",
          destination: "https://air.air7.fun/wiki/:path*",
        },
      ],
    };
  },
};

export default nextConfig;
