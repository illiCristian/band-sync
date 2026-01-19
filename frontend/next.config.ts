import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
    // This addresses the specific error regarding 10MB limit in the proxy/middleware
    // @ts-ignore - Some versions might not have this in the type yet
    middlewareClientMaxBodySize: '100mb',
  }
};

export default nextConfig;
