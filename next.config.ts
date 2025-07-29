import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'https://pkdvdzkn-3000.inc1.devtunnels.ms'],
    },
  },
  /* config options here */
}
export default nextConfig
