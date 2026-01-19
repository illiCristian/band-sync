import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*', // Proxy to Backend
      },
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:3001/uploads/:path*', // Proxy to Uploads
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