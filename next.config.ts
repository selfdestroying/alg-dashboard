import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  allowedDevOrigins: ['alg.test', '*.alg.test'],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'images.alg.tw1.ru',
      },
    ],
  } /* config options here */,
}

export default nextConfig
