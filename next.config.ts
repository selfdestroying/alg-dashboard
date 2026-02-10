import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    process.env.NEXT_PUBLIC_ROOT_DOMAIN?.split(':')[0] || '',
    `*.${process.env.NEXT_PUBLIC_ROOT_DOMAIN?.split(':')[0] || ''}`,
  ],
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
