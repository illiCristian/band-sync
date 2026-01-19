import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  async rewrites() {
    // Usamos el valor por defecto si no existe la variable para que no rompa el build
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`,
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