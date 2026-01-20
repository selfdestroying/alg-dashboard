import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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
