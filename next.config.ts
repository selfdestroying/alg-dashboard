import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'images.alg.tw1.ru',
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'https://pkdvdzkn-3000.inc1.devtunnels.ms'],
      bodySizeLimit: '5mb',
    },
  },
}
export default nextConfig
