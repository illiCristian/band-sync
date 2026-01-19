import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`, // Proxy to Backend
      },
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`, // Proxy to Uploads
      },
    ];
  },
  // Eliminamos o comentamos la parte experimental temporalmente para descartar errores
  /*
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  }
  */
};
export default nextConfig;