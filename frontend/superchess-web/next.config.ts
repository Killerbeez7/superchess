import type { NextConfig } from "next";

const backendApiUrl = (
  process.env.BACKEND_API_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  ""
)
  .trim()
  .replace(/\/$/, "");

const nextConfig: NextConfig = {
  // Proxy REST API calls through the app domain so refresh cookies are first-party.
  async rewrites() {
    if (!backendApiUrl) return [];

    return [
      {
        source: "/api/:path*",
        destination: `${backendApiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
